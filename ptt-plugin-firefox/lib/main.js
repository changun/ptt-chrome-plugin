// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

// Create a page mod
// It will run a script whenever a ".org" URL is loaded
// The script replaces the page contents with a message
pageMod.PageMod({
    include: [
      /^http:\/\/tw.news.yahoo.com\/.*html/,
      /^https:\/\/tw.news.yahoo.com\/.*html/,
      /^http:\/\/www\.nownews\.com\/n\/.*/,
      /^https:\/\/www\.nownews\.com\/n\/.*/,
      /^http:\/\/www.chinatimes.com\/realtimenews\/.*/,
      /^https:\/\/www.chinatimes.com\/realtimenews\/.*/,
      /^http:\/\/www.chinatimes.com\/newspapers\/.*/,
      /^https:\/\/www.chinatimes.com\/newspapers\/.*/,
      /^http:\/\/udn.com\/news\/story\/(\d*)\/(\d*)/,
      /^https:\/\/udn.com\/news\/story\/(\d*)\/(\d*)/,
      /^http:\/\/news\.ltn\.com\.tw\/news\/.*/,
      /^https:\/\/news\.ltn\.com\.tw\/news\/.*/,
      /^http:\/\/.*appledaily.com.tw\/.*\/article\/.*/,
      /^https:\/\/.*appledaily.com.tw\/.*\/article\/.*/,
      /^http:\/\/www.ettoday.net\/news\/(\d*)\/.*htm.?.*/,
      /^https:\/\/www.ettoday.net\/news\/(\d*)\/.*htm.?.*/,
      /http:\/\/www.stormmediagroup.com\/opencms\/.*\/detail\/.*/,
      /^http:\/\/www.peoplenews.tw\/news\/.*/,
      /^http:\/\/newtalk.tw\/news\/.*/   
    ],
    contentStyleFile: [
        self.data.url("assets/css/semantic.css"),
        self.data.url("assets/css/plugin.css"),
        self.data.url("assets/css/bbs.css")
    ],
    contentScriptFile: [
        self.data.url("assets/javascripts/ga.js"),
        self.data.url("assets/javascripts/jquery-2.1.3.min.js"), 
        self.data.url("assets/javascripts/jquery.mousewheel.js"),
        self.data.url("assets/javascripts/jquery.later.js"),
        self.data.url("assets/javascripts/semantic.js"),
        self.data.url("assets/javascripts/moment-with-langs.min.js"), 
        self.data.url("assets/javascripts/URI.js"), 
        self.data.url("assets/javascripts/contentscript.js") 
    ]
});
