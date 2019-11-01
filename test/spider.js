
const jsdom = require("jsdom");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const {JSDOM} = jsdom;

const Html2Md = require("./html2md.js");

const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_ATTRIBUTE = 2;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_COMMENT = 8;
const NODE_TYPE_DOCUMENT = 9;

class Spider  {
    constructor(opts) {
        this.title = opts.title || "spider";
        this.url = opts.url;
        this.navSelector = opts.navSelector;
        this.contentSelector = opts.contentSelector;
        this.html2md = new Html2Md();
    }

    async run() {
        const navs = await this.getNavs({url: this.url, selector: this.navSelector});

        //console.log(JSON.stringify(navs, undefined, 4));
        const node = {
            title: this.title,
            children: navs,
            index: 0,
            //url: this.url,
        }

        const self = this;
        const grab = async (node, prefix = "") => {
            const filepath = path.join(prefix, node.title);
            node.filepath = filepath;
            if (node.children && node.children.length !== 0) {
                if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
            }

            if (node.url) {
                const filename = filepath + ".md";
                node.filename = filename;
                console.log(`抓取: ${node.title} ${node.url}`);
                const text = await self.html2md.parseUrl(node.url, {selector: this.contentSelector});
                fs.writeFileSync(filename, text);
            }

            for (let i = 0; i < node.children.length; i++) {
                await grab(node.children[i], filepath);
            }
        }

        await grab(node);

        fs.writeFileSync(path.join(node.title, "book.json"), JSON.stringify(node));
    }

    async getNavs({url, selector}) {
        const htmlstr = await axios.get(url).then(res => res.data);
        const dom = new JSDOM(htmlstr);
        const navDom = dom.window.document.querySelector(selector) || dom.window.document;

        let navs = [];
        const parseNav = (node, dept = 0) => {
            const nodeName = node.nodeName.toLowerCase();
            
            if (node.nodeType !== NODE_TYPE_ELEMENT) return;
            
            if (nodeName === 'a') {
                const href = node.getAttribute("href");
                navs.push({
                    dept,
                    title: node.textContent.replace(/\//g, '-'),
                    url: (!href || href === 'javascript:') ? "" : href.indexOf("http") === 0 ? href : (path.dirname(url) + "/" + href),
                    children: [],
                });
                return;
            }
            
            for(let i = 0; i < node.childNodes.length; i++) {
                const childnode = node.childNodes[i];
                parseNav(childnode, dept+1);
            }
        }
        parseNav(navDom);
        const rootmap = {}, list = [];
        for (let i = 0; i < navs.length; i++) {
            navs[i].index = i;
            navs[i].parentIndex = -1;
            rootmap[i] = navs[i];

            for (let j = i - 1; j >= 0; j--) {
                if (navs[j].dept < navs[i].dept) {
                    navs[i].parentIndex = j;
                    break;
                }
            }

            const parentIndex = navs[i].parentIndex;
            if (rootmap[parentIndex]) {
                rootmap[parentIndex].children.push(navs[i]);
            } else {
                list.push(navs[i]);
            }
        }

        return list;
    }
}

module.exports = Spider;
