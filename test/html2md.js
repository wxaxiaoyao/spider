
const jsdom = require("jsdom");
const axios = require("axios");
const path = require("path");
const _ = require("lodash");
const {JSDOM} = jsdom;

const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_ATTRIBUTE = 2;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_COMMENT = 8;
const NODE_TYPE_DOCUMENT = 9;

class Html2Md {
    constructor(opts = {}) {
    }

    parse(node, opts) {
        let text = "";
        for (let i = 0; i < node.childNodes.length; i++) {
            const childnode = node.childNodes[i];
            //console.log(node, node.nodeName, node.nodeType);
            if (childnode.nodeType === NODE_TYPE_TEXT && _.trim(childnode.nodeValue, " \n\t") === "") continue;
            if ((childnode.nodeType === NODE_TYPE_ELEMENT && childnode.nodeName.toLowerCase() === "div")) continue;
            text += this.parseBlock(childnode, opts) + "\n\n";
        }
        return text;
    }

    parseText(htmlstr, opts) {
        const dom = new JSDOM(htmlstr);
        const contentDom = dom.window.document.body;
        return this.parse(contentDom);
    }

    async parseUrl(url, opts) {
        const htmlstr = await axios.get(url).then(res => res.data);
        const dom = new JSDOM(htmlstr);
        const contentDom = dom.window.document.querySelector(opts.selector) || dom.window.document.body;
        return this.parse(contentDom, {...opts, url});
    }

    _escape(text) {
        return text.replace(/\*/g, '\\*').replace(/\[/g, '\\[');
    }

    getNodeText(node) {
        if (node.nodeType === NODE_TYPE_TEXT) return this._escape(node.nodeValue);

        let texts = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            const childnode = node.childNodes[i];
            texts.push(this.getNodeText(childnode, node));
        }

        return texts.join("");
    }

    getNodeValue(node, parentNode, opts) {
        if (node.nodeType === NODE_TYPE_TEXT) return this._escape(node.nodeValue);

        let texts = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            const childnode = node.childNodes[i];
            texts.push(this.getNodeValue(childnode, node, opts));
        }

        let text = texts.join("");

        const nodeName = node.nodeName.toLowerCase();
        if (nodeName === "strong") {
            if (parentNode && (parentNode.nodeName.toLowerCase() === "strong" || parentNode.nodeName.toLowerCase() === 'em')) return `**${text}**`;
            else return ` **${text}** `;
        } else if (nodeName === "em") {
            if (parentNode && (parentNode.nodeName.toLowerCase() === "strong" || parentNode.nodeName.toLowerCase() === 'em')) return `*${text}*`;
            else return ` *${text}* `;
        } else if (nodeName === 'code') {
            return '`' + text + '`';
        } else if (nodeName === "img") {
            let src = node.getAttribute("src");
            if (!src) return;
            if (src.indexOf("http") !== 0 && opts && opts.url) {
                src = path.dirname(opts.url) + "/" +  src;
            }
            return `![](${src})`;
        }

        return text;
    }

    parseList(node) {
        const nodeName = node.nodeName.toLowerCase();
        const sort = nodeName === 'ol';
        let text = "";

        for (let i = 0; i < node.childNodes.length; i++) {
            const childnode = node.childNodes[i];
            const childnodeName = childnode.nodeName.toLowerCase();
            if (childnodeName !== "li") continue;
            const nodeValue = this.getNodeValue(childnode);
            if (sort) {
                text += `${i+1}. ${nodeValue}\n`;
            } else {
                text += `- ${nodeValue}\n`;
            }
        }

        return text;
    }

    parseTable(node) {
        const tables = [];

        const self = this;
        const parseNode = (node) => {
            const nodeName = node.nodeName.toLowerCase();
            if (nodeName === 'td' || nodeName === 'th') {
                tables[tables.length - 1].push(self.getNodeValue(node));
                return;
            }
            if (nodeName === 'tr') {
                tables.push([]);
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                parseNode(node.childNodes[i]);
            }
        }
        parseNode(node);
        if (tables.length === 0) return "";
        tables.splice(1, 0, _.fill(Array(tables[0].length), ':-:'));
        const text = tables.map(line => `|${line.join('|')}|`).join('\n');
        //console.log(tables);
        //console.log(text);
        return text;
    }

    parseBlock(node, opts) {
        const nodeName = node.nodeName.toLowerCase();
        let text = "";

        if (/^[hH][1-6]$/.test(nodeName)) {
            const no = _.toNumber(nodeName.substring(1));
            text = _.fill(Array(no), "#").join("") + " " + text;
        } 

        if (nodeName === "ol" || nodeName === "ul") { 
            return this.parseList(node);
        } else if (nodeName === 'pre') {
            return '```\n'+ _.trim(this.getNodeText(node)) +'\n```';
        } else if (nodeName === 'table') {
            return this.parseTable(node);
        }

        for (let i = 0; i < node.childNodes.length; i++) {
            const childnode = node.childNodes[i];
            text += this.getNodeValue(childnode, node, opts);
        }

        return text;

    }
}

module.exports = Html2Md;
