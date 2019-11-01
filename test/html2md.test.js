
const Html2Md = require("./html2md.js");
const Spider = require("./spider.js");

describe("html2md", async () => {
    it ("Nginx 中文官方手册", async () => {
        const spider = new Spider({
            title: "Nginx 中文官方手册",
            url: "http://book.h3399.cn/index-15.htm",
            navSelector: ".side-nav-inner-box.J-sideNavInnerBox",
            contentSelector: "#docArticleContent",
        });

        await spider.run();
    });

    it ("Docker 从入门到实战", async() => {
        const spider = new Spider({
            title: "Docker 从入门到实战",
            url: "http://book.h3399.cn/index-16.htm",
            navSelector: ".side-nav-inner-box.J-sideNavInnerBox",
            contentSelector: "#docArticleContent",
        });

        await spider.run();
    });

    it ("七天学会 NodeJs", async() => {
        const spider = new Spider({
            title: "七天学会 NodeJs",
            url: "http://book.h3399.cn/index-5.htm",
            navSelector: ".side-nav-inner-box.J-sideNavInnerBox",
            contentSelector: "#docArticleContent",
        });

        await spider.run();
    });

    it ("Redis 设计与实现 (第二版)", async() => {
        const spider = new Spider({
            title: "Redis 设计与实现 (第二版)",
            url: "http://book.h3399.cn/index-7.htm",
            navSelector: ".side-nav-inner-box.J-sideNavInnerBox",
            contentSelector: "#docArticleContent",
        });

        await spider.run();
    });
    it("test", async () => {
        //const html2md = new Html2Md();
        //await html2md.parseUrl(' http://book.h3399.cn/30954.html', {selector:"#docArticleContent"});
        //const text = html2md.parseText(`<table><tbody><tr><td>TERM, INT</td>          <td>快速关闭</td>        </tr><tr><td>QUIT</td>          <td>从容关闭</td>        </tr><tr><td>HUP</td>          <td>重载配置<br>          用新的配置开始新的工作进程<br>          从容关闭旧的工作进程</td>        </tr><tr><td>USR1</td>          <td>重新打开日志文件</td>        </tr><tr><td>USR2</td>          <td>平滑升级可执行程序。</td>        </tr><tr><td>WINCH</td>          <td>从容关闭工作进程</td>        </tr></tbody></table>`);
        //console.log(html2md.parse(htmlstr));
        //const dom = new JSDOM(htmlstr);
        ////console.log(dom);

        //const contentDom = dom.window.document.getElementById("docArticleContent");
        //console.log(contentDom);
        //console.log(contentDom.childNodes);
        //for (let i = 0; i < contentDom.childNodes.length; i++) {
            //const node = contentDom.childNodes[i];
            //console.log(node);
            //console.log(node.nodeName, node.nodeValue, node.nodeType);
        //}
        //console.log(dom.window.document.getElementById("docArticleContent").textContent);
    });
});
