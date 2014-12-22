// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

// Create a page mod
// It will run a script whenever a ".org" URL is loaded
// The script replaces the page contents with a message
pageMod.PageMod({
    include: [
        "http://tw.news.yahoo.com/*",
        "https://tw.news.yahoo.com/*",
        "http://www.nownews.com/n/*",
        "https://www.nownews.com/n/*",
        "http://www.chinatimes.com/realtimenews/*",
        "https://www.chinatimes.com/realtimenews/*",
        "http://udn.com/*",
        "https://udn.com/*",
        "http://news.ltn.com.tw/news/*",
        "https://news.ltn.com.tw/news/*",
        "http://www.appledaily.com.tw/realtimenews/article/*",
        "https://www.appledaily.com.tw/realtimenews/article/*"
        ],
    contentStyleFile: [
        self.data.url("assets/css/bbs.css"),
        self.data.url("assets/css/plugin.css"),
        self.data.url("assets/css/semantic.css"),
        self.data.url("assets/css/semantic.min.css")
    ],
    contentScriptFile: [
        self.data.url("assets/javascripts/jquery-2.1.3.min.js"), 
        self.data.url("assets/javascripts/jquery.mousewheel.js"),
        self.data.url("assets/javascripts/semantic.min.js"), 
        self.data.url("assets/javascripts/moment-with-langs.min.js"), 
        self.data.url("assets/javascripts/URI.js"),
        self.data.url("assets/javascripts/contentscript.js") 
        ]

});
