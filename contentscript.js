
var $body = $('body');
var site = "//lifestreams.smalldata.io/ptt";
var url = new URI(window.location.href).hostname();

// the following DOM variables need to be initialized using jQuery selector.
var $headline,// the DOM that contains the title of the article.
    $articleContent; // the DOM that contains the content of the article.


// the following constant variables are all numeric values and need to be initialized for each website.
var headlineTop, // the initial top value of the launcher button,
    launcherTopPos; // the top value of the launcher button when it has been squeezed to the upper right corner due to scrolling;


/** Initialization for each specific News Website**/
if(url.indexOf('yahoo') >=0) {
    // yahoo
     $headline = $(".headline");
     headlineTop = $headline.position()["top"];
     $articleContent = $(".yom-art-content p");
     launcherTopPos = 31;
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
    $headline = $('.story_title');
    headlineTop = $('.story_title').position()["top"];
    $articleContent = $('.story p');
    launcherTopPos = 10;

}else if (url.indexOf('ltn') >= 0){
    // liberty
    $headline = $('h1');
    headlineTop = $headline.position()["top"] + 10;
    $articleContent = $('#newstext p');
    launcherTopPos = 10;
}else if(url.indexOf('apple') >= 0){
    // apple daily
    $headline = $('#h1');
    headlineTop = $headline.position()["top"] + 10;
    $articleContent = $("#summary");
    launcherTopPos = 10;
}



/** the parameter that will be sent to the search engine **/
var title = $headline.text();
var articleContent = $articleContent.text();
var request = {"title": title,
               "content": (title + articleContent),
               "href": window.location.href};
var response;
/** send request **/
$.ajax
({
    type: "POST",
    //the url where you want to sent the userName and password to
    url: site + '/search',
    async: true,
    //json object to sent to the authentication url
    data: JSON.stringify(request),
    success: function (ret) {
        response = ret;
        // run init function if the dom creation is also completed
        isComplete();
    }
});
var launcherTitle = '<i class="announcement icon"></i><span class="ui-text">看看鄉民怎麼說?</span>';



/** create plugin DOMs **/

var _domCreated;
// launcher
var $leftLauncher = $('<div id="launcher" class="ui black small launch right attached fixed transition hidden button" style="font-size: 15px">'+launcherTitle+'</div>');
// move launcher button to be vertically aligned with the article headline
$leftLauncher.css({top: headlineTop});

// sidebar menu
var $menu = $('<div class="ui vertical plugin-menu sidebar inverted very wide right">\n    <div class="header item">\n        <i id="lock" class="icon unlock alternate"></i>\n        相關文章\n    </div>\n\n</div>\n        ');

// modal
var $modal =$('<div class="ui modal" id="ptt-modal"><i class="close icon"></i></div>');
// append the DOMs to the body
$body.append($menu);
$body.append($leftLauncher);
$body.append($modal);

// create sidebar
$menu
    .sidebar({
        transition       :  'overlay',
        mobileTransition : 'overlay',
        dimPage : false,
        duration: 1,
        onHide: function(event){
            // show the launcher button
            $leftLauncher.removeClass('hidden');
        }
    });

// set on mouseover handler
$leftLauncher.on('mouseover', function(event) {

    $menu.sidebar('show');
    $leftLauncher.addClass('hidden');
    event.preventDefault();
});

// set on scroll listener to dynamically adjust the position of the launcher
$(window).on("scroll", function(e) {
    var scrollTop = $body.scrollTop();
    if (scrollTop > headlineTop && !$leftLauncher.hasClass('fixed-top')) {
        $leftLauncher.addClass("fixed-top");
        $leftLauncher.css({top: launcherTopPos});

    } else if($body.scrollTop() <= headlineTop && $leftLauncher.hasClass('fixed-top')){
        $leftLauncher.removeClass("fixed-top");
        $leftLauncher.css({top: headlineTop});
    }
});

// this prevents the menu's scrolling from effecting the whole window's scrolling
// IT REQUIRES jquery.mousewheel.js to work!
$menu.bind('mousewheel', function(e, d) {
    var height = $menu.height();
    var scrollHeight = $menu.get(0).scrollHeight;
    // when the menu scroll bar hit the bottom or top of the menu, prevent default event
    if(((scrollHeight - height) - this.scrollTop <= 2  && d < 0) || (this.scrollTop <= 2 && d > 0)) {
        e.preventDefault();
    }
});

_domCreated = true;
// check if both DOM creation and ajax request are completed
isComplete();

var _init;
function isComplete(){
    // run init function when both ajax request and DOM creation are completed
    if(response && _domCreated && !_init){
        _init = true;
        init(response);
    }
}
var showPost = function (event){
    var uri = site + "/posts/" + $(this).data('post');
    $.ajax
    ({
        type: "GET",
        //the url where you want to sent the userName and password to
        url: uri,
        async: true,
        success: function (ret) {
            var $postContent = $(ret).find('#main-content');
            var $prevPostContnet = $modal.find('#main-content');
            if($prevPostContnet.length){
                $prevPostContnet.replaceWith($postContent);
            }else{
                $modal.append($postContent);
            }

            $modal
                .modal('setting', 'transition', 'horizontal flip')
                .modal('show')
            ;
        }
    });

}
function init(ret){
    /** populate the sidebar content **/
    if(ret.articles.length > 0){
        ret.articles.forEach(function(e){
            var board_id = e.id.split(":");
            var board = board_id[0];
            var file = board_id[1] + ".html";
            var href = 'https://www.ptt.cc/bbs/'+ board + '/'+ file;
            var title = e.title ? e.title : e.subject;
            var ago = moment(e.last_modified).locale("zh-tw").fromNow();
            var popularity;
            if(e.popularity >= 100){
                popularity = '<span class="push-count f1 hl">爆</span>';
            }else if(e.popularity >= 10){
                popularity = '<span class="push-count hl f3">'+e.popularity +'</span>'
            }else{
                popularity = '<span class="push-count hl f2">'+e.popularity +'</span>'
            }
            $('<a class="post item r-ent"></a>')
                .append(popularity)
                .append('<span class="ui title">' + title +'</span>')
                .append('<span class="ui date detail"> ' + ago +'</span>')
                .data("post", board + '/' + board_id[1])
                .appendTo($menu)
                .click(showPost);
        });


    }
    if(ret.comments){
        var board_id = ret.comments._id.split(":");
        var board = board_id[0];
        var header =
                $('<div class="header item" id="comment-header"><i class="comment icon"></i><span class="sub header"> '+ret.comments.title+'</span></div>')
                .appendTo($menu)
                .data("post", board + '/' + board_id[1])
                .click(showPost)
            ;
        var count = 0;
        ret.comments.pushed.forEach(function(e){
            count ++;
            if(count > 50){
                return null;
            }
            var tag = null;
            if(e.op == "推"){
                tag = '<span class="hl push-tag">推</span>';
            }else if(e.op == "→"){
                tag = '<span class="f1 hl push-tag">→</span>';
            }else if(e.op == "噓"){
                tag = '<span class="f1 hl push-tag">噓</span>';
            }
            var content = URI.withinString(e.content, function(url) {
                return '<a target="_blank" href="'+url+'">' + url + '</a>';
            });
            $('<a class="item push"></a>')
                .append(tag)
                .append('<span class="f3 hl push-userid">' + e.user +'</span>')
                .append('<span class="f3 push-content">: ' + content +'</span>')
                .appendTo($menu);
        });
        // add an empty element to the bottom to fix the scroll bar issue
        $('<a class="item"></a>')
            .appendTo($menu);

    }

    /** Maintain the locking function **/
    var $lock = $("#lock");

    // check if the sidebar has been locked by the user
    chrome.storage.local.get({'lock?': 'unlocked'}, function(ret) {
        // automatically show the sidebar if the user has chosen to lock it
        if(ret["lock?"] == 'locked'){
            $lock.removeClass('unlock').addClass('lock');
            $menu.sidebar('show');
            $leftLauncher.addClass('hidden');
        }else{
            /** Fade-in the launcher **/
            $leftLauncher.transition('horizontal flip', '1000ms');
        }
    });
    $lock.click(function(event){
        var locked = !$lock.hasClass('lock');
        if(locked){
            $lock.removeClass('unlock').addClass('lock');

        }else{
            $lock.removeClass('lock').addClass('unlock');
        }
        chrome.storage.local.set({'lock?': locked? 'locked': 'unlocked'}, function(){
            console.log(locked);
        });
    });


}

