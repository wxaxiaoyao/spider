
const jsdom = require("jsdom");
const axios = require("axios");
const {JSDOM} = jsdom;

describe("html2md", async () => {
    it("html2md", async () => {

        const htmlstr = await axios.get("http://book.h3399.cn/2.1_mainmodule.html").then(res => res.data);
        const dom = new JSDOM(htmlstr);
        //console.log(dom);

        const contentDom = dom.window.document.getElementById("docArticleContent");
        console.log(contentDom);
        console.log(contentDom.childNodes);
        for (let i = 0; i < contentDom.childNodes.length; i++) {
            const node = contentDom.childNodes[i];
            console.log(node);
            console.log(node.nodeName, node.nodeValue, node.nodeType);
        }
        //console.log(dom.window.document.getElementById("docArticleContent").textContent);
    });
});
