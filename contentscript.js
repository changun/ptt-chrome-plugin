// chrome extension
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-58095038-1']);
var url = new URI(window.location.href).hostname();
_gaq.push(['_trackPageview']);
// body
var $body = $('body');
// the search endpoint
var searchEndpointUrl = "//www.ptt.rocks/search";
var sharePostEndpointUrl = "https://www.ptt.rocks/share/index.html";

// url to get the post
var postUrl = function(id){
    var board_id = id.split(":");
    var board = board_id[0];
    var file = board_id[1] + ".html";
    return "//s3-us-west-2.amazonaws.com/ptt.rocks/posts/" + board + '/' + file;
};
// url to the share page
var sharePageUrl = function(id){
    var board_id = id.split(":");
    var board = board_id[0];
    var file = board_id[1] + ".html";
    return "https://www.ptt.rocks/share/" + board + '/' + file;
};


// the following DOM variables need to be initialized using jQuery selector.
var $headline,// the DOM that contains the title of the article.
    $articleContent; // the DOM that contains the content of the article.


// the following constant variables are all numeric values and need to be initialized for each website.
var headlineTop, // the initial top value of the launcher button,
    launcherTopPos; // the top value of the launcher button when it has been squeezed to the upper right corner due to scrolling;

/** flags for synchronization **/

var _domCreated;
var _responseReceived;
var _available;
var _init;

function isComplete(){
    // run init function when both ajax request and DOM creation are completed
    if(_responseReceived && _domCreated && !_init){
        _init = true;
        init(response);
    }
}

/** Initialization for each specific News Website**/

if(url.indexOf('yahoo') >=0) {
    // yahoo
     $headline = $(".headline");
     headlineTop = $headline.position()["top"];
     $articleContent = $(".yom-art-content p");
    if($("#UH").length){
        launcherTopPos = $("#UH").height();
    }else{
        launcherTopPos = 31;
    }
}else if (url.indexOf('nownews') >= 0){
    // NowNews
     $headline = $('.news_story h1');
     headlineTop = $headline.position()["top"];
     $articleContent = $(".story_content p");
     launcherTopPos = 10;
}else if (url.indexOf('chinatimes') >= 0){
    // chinatimes
     $headline = $('.page_container').find('h1');
     headlineTop = $('.page_container').position()["top"] + 55;
     $articleContent = $('article p');
     launcherTopPos = 10;
}else if (url.indexOf('udn') >= 0){
    // udn
    $headline = $('#story_art_title');
    headlineTop = $headline.offset()["top"];
    $articleContent = $('.story p,#story_body p');
    launcherTopPos = 40;
}else if (url.indexOf('ltn') >= 0){
    // liberty
    $headline = $('h1');
    headlineTop = $headline.position()["top"] + 10;
    $articleContent = $('#newstext p');
    launcherTopPos = 10;
}else if(url.indexOf('apple') >= 0){
    // apple ent
    $headline = $('#h1');
    headlineTop = $headline.position()["top"] + 10;
    launcherTopPos = 10;
    $articleContent = $("#summary,.articulum p,.articulum h2");
}else if(url.indexOf("ettoday") >= 0){
    //ettoday
    $headline = $('h2.title');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $("div.story sectione > p");
    launcherTopPos = 10;
}else if(url.indexOf("storm") >= 0){
    //stormmedis
    $headline = $(".article_head .title-wrap .title");
    headlineTop = $headline.offset()["top"] + 20;
    $articleContent = $(".section_article_show article p");
    launcherTopPos = 20;
}else if (url.indexOf("peoplenews") >= 0) {
    // peoplenews
    $headline = $('#news .news_title');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $("#newscontent p");
    launcherTopPos = 45;
} else if (url.indexOf("newtalk") >= 0) {
    // newtalks
    $headline = $('#left_column .content_title');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $("#news_content txt");
    launcherTopPos = 10;
} else if (url.indexOf("mypeople") >= 0 ) {
    // mypeople
    $headline = $('h1 span');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $('.post-inner .entry p');
    launcherTopPos = 10;
} else if (url.indexOf("cna") >= 0) {
    // CNA
    $headline = $('.news_title h1');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $('.article_box p');
    launcherTopPos = 40;
} else if (url.indexOf("rti.org") >= 0) {
    // rti
    $headline = $('#print_headline');
    headlineTop = $headline.offset()["top"] + 10;
    $articleContent = $('#print_content');
    launcherTopPos = 40;
}
_gaq.push(['_trackEvent', "init", url]);


if($headline && $articleContent) {
    /** the parameters that will be sent to the search engine **/
    var title = $headline.text();
    var articleContent = $articleContent.text();
    var request = {
        "title": title,
        "content": (title + articleContent),
        "href": window.location.href
    };
    var response;
    /** send request **/
    $.ajax
    ({
        type: "POST",
        //the url where you want to sent the userName and password to
        url: searchEndpointUrl,
        async: true,
        //json object to sent to the authentication url
        data: JSON.stringify(request),
        success: function (ret) {
            response = ret;
            _responseReceived = true;
            // run init function if the dom creation is also completed
            isComplete();
        }
    });


    /** create plugin DOMs **/

// launcher
    var $leftLauncher = $('<div id="launcher" class="ui black small launch right attached fixed transition hidden button" style="font-size: 15px">\n    <div><i class="announcement icon"></i><span class="ui-text" id="launcher-title">看看鄉民怎麼說?</span></div>\n    \n    </div>');
// move launcher button to be vertically aligned with the article headline
    $leftLauncher.css({top: headlineTop});

// sidebar menu
    var $menu = $('<div class="ui vertical plugin-menu sidebar inverted very wide right">\n\n</div>\n        ');

// modal
    var $modal = $('<div class="ui modal large" id="ptt-modal"><i class="close icon"></i></div>');
// append the DOMs to the body
    $body.append($menu);
    $body.append($leftLauncher);
    $body.append($modal);


// show launcher
// check if the sidebar has been locked by the user
    chrome.storage.local.get({'lock?': 'unlocked'}, function (ret) {
        // automatically show the sidebar if the user has chosen to lock it
        if (ret["lock?"] == 'unlocked') {
            $leftLauncher.transition('horizontal flip', '1000ms');
        }
    });

// create sidebar
    $menu.sidebar({
        transition: 'overlay',
        mobileTransition: 'overlay',
        dimPage: false,
        duration: 1,
        onHide: function (event) {
            // show the launcher button
            $leftLauncher.removeClass('hidden');
        },
        onShow: function (e) {
            $lock = $("#lock");
            $lock.popup('hide').popup('destroy').popup({html: '<div class="column"><i class="idea icon large"></i></div>'});
            chrome.storage.local.get({'has-locked': 'false', 'first-time': 'true'}, function (ret) {
                // show description for the locker if it has never been clicked before
                // AND it is the first time the user open the sidebar OR a random number is > 0.7
                if ((ret["has-locked"] == 'false' || ret["has-locked"] == false) &&
                    (ret["first-time"] == 'true' || ret["first-time"] == true || Math.random() > 0.7)) {

                    $lock.popup("show");
                    $.later(3000, this, function () {
                        $lock.popup("hide");
                    })
                }
            });
            chrome.storage.local.set({'first-time': false}, function () {
            });
        }
    });


    var setMouseOverEvent = function (isAvailable) {
        if (isAvailable) {
            // set on mouseover handler
            $leftLauncher.on('mouseover', function (event) {
                $menu.sidebar('show');
                $leftLauncher.addClass('hidden');
                event.preventDefault();
                _gaq.push(['_trackEvent', "show-sidebar", 'mouseover']);
            });
        } else {
            var $launcherTitle = $("#launcher-title");
            var $launcherIcon = $(".icon.announcement");
            var originalTitle = $launcherTitle.html();
            $leftLauncher.on('mouseover', function (event) {
                $launcherTitle.html("暫無相關評論");
                $launcherIcon.removeClass("announcement");
                $launcherIcon.addClass("frown");
                event.preventDefault();
            });
            $leftLauncher.on('mouseout', function (event) {
                $launcherTitle.html(originalTitle);
                $launcherIcon.addClass("announcement");
                $launcherIcon.removeClass("frown");
                event.preventDefault();
            });
        }
    };

// set on scroll listener to dynamically adjust the position of the launcher
    $(window).on("scroll", function (e) {
        var scrollTop = $body.scrollTop();
        if (headlineTop - scrollTop <= launcherTopPos && !$leftLauncher.hasClass('fixed-top')) {
            $leftLauncher.addClass("fixed-top");
            $leftLauncher.css({top: launcherTopPos});

        } else if (headlineTop - scrollTop > launcherTopPos && $leftLauncher.hasClass('fixed-top')) {
            $leftLauncher.removeClass("fixed-top");
            $leftLauncher.css({top: headlineTop});
        }
    });


// this prevents the menu's scrolling from effecting the whole window's scrolling
// IT REQUIRES jquery.mousewheel.js to work!
    $menu.bind('mousewheel', function (e, d) {
        var height = $menu.height();
        var scrollHeight = $menu.get(0).scrollHeight;
        // when the menu scroll bar hit the bottom or top of the menu, prevent default event
        if (((scrollHeight - height) - this.scrollTop <= 2 && d < 0) || (this.scrollTop <= 2 && d > 0)) {
            e.preventDefault();
        }
    });

    _domCreated = true;
// check if both DOM creation and ajax request are completed
    isComplete();


    function init(ret) {
        // show the ptt post in the modal when the user clicks a post
        var showPost = function (event) {

            var $item = $(this);
            var uri = postUrl($item.data('id'));
            var type = $item.data('type');
            var index = $item.data('index');
            var $prevPostContnet = $modal.find('div').remove();


            $modal.append($("<div>").addClass("ui indeterminate text loader active")
                .html("Loading"))
                .modal('setting', 'transition', 'horizontal flip')
                .modal('show');
            $.ajax
            ({
                type: "GET",
                url: uri,
                async: true,
                success: function (ret) {
                    var $postContent = $(ret)
                        .find('#main-content')
                        .attr("id", "ptt-main-content"); // replace id with ptt-main-content to avoid conflict
                    var $lastMetaLine =
                        $postContent
                            .find('.article-metaline')
                            .last();
                    var sharePopup = function(url){
                            var width = 600, height=400;
                            var leftPosition, topPosition;
                            //Allow for borders.
                            leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
                            //Allow for title and status bars.
                            topPosition = (window.screen.height / 2) - ((height / 2) + 50);
                            var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";
                            window.open("https://www.facebook.com/share.php?u=" + url,'sharer', windowFeatures);
                            _gaq.push(['_trackEvent', "share-post", type]);
                            return false;
                    };
                    $('<button id="fb-like" class="ui facebook button big fb-like sticky" style="padding: 5px;margin-top: 10px"><i class="facebook  square icon"></i>分享</button>')
                        .insertAfter($lastMetaLine)
                        .click(function(){
                            sharePopup(sharePageUrl($item.data('id')))
                        });


                    $postContent.find(".f2 a")
                        .attr("href", sharePageUrl($item.data('id')))


                    $modal.find('div').remove();
                    $modal.append($postContent);



                    console.log($modal.modal('can fit'));
                    $modal.modal("refresh");
                    _gaq.push(['_trackEvent', "show-post", type]);
                }
            });

        };
        /** populate the sidebar content **/
        // populate related articles
        if (ret["excellent-articles"] && ret["excellent-articles"].length > 0) {
            _available = true;
            var header =
                $('<div class="header item" id="excellent-article-header"><span class="subHeader">精選文章</span></div>')
                    .appendTo($menu);
            ret["excellent-articles"].forEach(function (e, index) {
                var title = e.title ? e.title : e.subject;
                var ago = moment(e.last_modified).locale("zh-tw").fromNow();
                var popularityTag = '<span class="push-count f4 hl">優</span>';

                $('<a class="post item r-ent"></a>')
                    .append(popularityTag)
                    .append('<span class="ui title">' + title + '</span>')
                    .append('<span class="ui date detail"> ' + ago + '</span>')
                    .data("id", e.id)
                    .data("type", "excellent-posts")
                    .data("index", index)
                    .appendTo($menu)
                    .click(showPost);
            });


        }
        /** populate the sidebar content **/
        // populate related articles
        if (ret.articles.length > 0) {
            _available = true;
            var header =
                $('<div class="header item">\n    相關文章\n</div>')
                    .appendTo($menu);
            ret.articles.forEach(function (e, index) {
                var board_id = e.id.split(":");
                var title = e.title ? e.title : e.subject;
                var ago = moment(e.last_modified).locale("zh-tw").fromNow();
                var popularity;
                if (e.popularity >= 100) {
                    popularity = '<span class="push-count f1 hl">爆</span>';
                } else if (e.popularity >= 10) {
                    popularity = '<span class="push-count hl f3">' + e.popularity + '</span>'
                } else {
                    popularity = '<span class="push-count hl f2">' + e.popularity + '</span>'
                }
                $('<a class="post item r-ent"></a>')
                    .append(popularity)
                    .append('<span class="ui title">' + title + '</span>')
                    .append('<span class="ui date detail"> ' + ago + '</span>')
                    .data("id", e.id)
                    .data("type", "related-posts")
                    .data("index", index)
                    .appendTo($menu)
                    .click(showPost);
            });


        }
        // populate comment
        if (ret["best-match"]) {
            _available = true;
            var id = ret["best-match"].id;
            var title = ret["best-match"].title;
            var ago = moment(ret["best-match"].last_modified).locale("zh-tw").fromNow();
            var header =
                $('<div class="header item r-ent" id="comment-header"><span class="subHeader"> ' + title + '</span><span class="ui date detail">' + ago + '</span></div>')
                    .appendTo($menu)
                    .data("id", id)
                    .data("type", "best-match-posts")
                    .data("index", 0)
                    .click(showPost);

            // fetch the post from S3
            $.ajax
            ({
                type: "GET",
                //the url where you want to sent the userName and password to
                url: postUrl(id),
                async: true,
                success: function (ret) {
                    var $post = $(ret);
                    // remove push times
                    $post.find("span.push-ipdatetime").remove();
                    // populate each push div to the sidebar
                    $post.find("div.push").each(function (index) {
                        var $pushDiv = $(this);
                        $('<a class="item push"></a>')
                            .append($pushDiv.children())
                            .data("id", id)
                            .data("type", "best-match-post")
                            .data("index", 0)
                            .appendTo($menu);

                    });
                    // add an empty element to the bottom of the menu to fix the scroll bar issue
                    $('<a class="item"></a>')
                        .appendTo($menu);
                }
            });

        }
        // add Lock icon to the first header in the sidebar
        var $lock = $('<i id="lock" class="icon unlock alternate" data-position="left center" ></i>');

        $(".ui.plugin-menu .header").first().append($lock);
        setMouseOverEvent(_available);
        _gaq.push(['_trackEvent', "loaded", url]);

        /** Maintain the locking function **/
            // check if the sidebar has been locked by the user
        chrome.storage.local.get({'lock?': 'unlocked'}, function (ret) {
            // automatically show the sidebar if the user has chosen to lock it
            if (ret["lock?"] == 'locked' && _available) {
                $lock.removeClass('unlock').addClass('lock');
                $menu.sidebar('show');
                _gaq.push(['_trackEvent', "show-sidebar", 'auto']);
                $leftLauncher.addClass('hidden');
            }
        });

        var popupTimer;
        $lock.click(function (event) {

            if (popupTimer) {
                popupTimer.cancel()
            }

            var locked = !$lock.hasClass('lock');
            if (locked) {
                $lock.removeClass('unlock').addClass('lock');
                _gaq.push(['_trackEvent', "lock", "lock"]);
                chrome.storage.local.set({'has-locked': true}, function () {
                });
                // show popup
                $lock.popup("hide").popup("destroy").popup({"title": '套件固定展開', "on": "click"}).popup("show");
                // hide popup in a moment
                popupTimer = $.later(2000, this, function () {
                    $lock.popup("hide").popup("destroy");
                })

            } else {
                $lock.removeClass('lock').addClass('unlock');
                _gaq.push(['_trackEvent', "lock", "unlock"]);
                chrome.storage.local.set({'has-unlocked': true}, function () {
                });
                // show popup
                $lock.popup("hide").popup("destroy").popup({"title": '取消', "on": "click"}).popup("show");
                // hide popup in a moment
                popupTimer = $.later(2000, this, function () {
                    $lock.popup("hide").popup("destroy");
                })

            }
            chrome.storage.local.set({'lock?': locked ? 'locked' : 'unlocked'}, function () {
                console.log(locked);
            });
        });


    }
}
