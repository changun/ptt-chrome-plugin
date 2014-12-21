
var $body = $('body');
var url = new URI(window.location.href).hostname();

// the following DOM variables need to be initialized using jQuery selector.
var $articleContainer,// (DEPRECATED) the container that contain the whole article. This is not used anymore!
    $bottom,// (DEPRECATED) where to add the bottom launcher button. (We don't do a bottom launcher button anymore!)
    $headline,// the DOM that contains the title of the article.
    $articleContent; // the DOM that contains the content of the article.


// the following constant variables are all numeric values and need to be initialized for each website.
var headlineTop, // the top value of the launcher button,
    launcherTopPos; // the top value of the launcher button after it has been squeezed to the upper left corner by scrolling;


/** Initialization for each specific News Website**/
if(url.indexOf('yahoo') >=0) {
    // yahoo
     $articleContainer = $('.yog-grid.yog-24u');
     $bottom = $('#mediasocialfollow_container').parent();
     $headline = $(".headline");
     headlineTop = $headline.position()["top"];
     $articleContent = $(".yom-art-content p");
     launcherTopPos = 31;
}else if (url.indexOf('nownews') >= 0){
    // NowNews
     $articleContainer = $('#container');
     $bottom = $('.news_story');
     $headline = $('.news_story h1');
     headlineTop = $headline.position()["top"];
     $articleContent = $(".story_content p");
     launcherTopPos = 10;

}else if (url.indexOf('chinatimes') >= 0){
    // chinatimes
     $articleContainer = $('.page_container');
     //$bottom = $('.news_story');
     $headline = $('.page_container').find('h1');
     headlineTop = $('.page_container').position()["top"] + 55;
     $articleContent = $('article p');
     launcherTopPos = 10;

}else if (url.indexOf('udn') >= 0){
    // udn
    $articleContainer = $('table.mainbg').first();
    //$bottom = $('.news_story');
    $headline = $('.story_title');
    headlineTop = $('.story_title').position()["top"];
    $articleContent = $('.story p');
    launcherTopPos = 10;

}else if (url.indexOf('ltn') >= 0){
    // liberty
    $articleContainer = $('#main');
    //$bottom = $('.news_story');
    $headline = $('h1');
    headlineTop = $headline.position()["top"] + 10;
    $articleContent = $('#newstext p');
    launcherTopPos = 10;
}else if(url.indexOf('apple') >= 0){
    // apple daily
    $articleContainer = $('#maincontent');
    $headline = $('#h1');
    headlineTop = $headline.position()["top"] + 10;
    $articleContent = $("#summary");
    launcherTopPos = 10;
}

/** article container margin **/
var origMargin = $articleContainer.css('margin');
var origMarginLeft = $articleContainer.css('margin-left');
var modifyContentMargin = (($body.width() - $articleContainer.innerWidth())/2) < 400;

/** the parameter that will be sent to the search engine **/
var title = $headline.text();
var articleContent = $articleContent.text();
var request = {"title": title,
               "content": (title + articleContent),
               "href": window.location.href};


var launcherTitle = '<i class="announcement icon"></i><span class="ui-text">看看鄉民怎麼說?</span>';

// create plugin DOMs
var $leftLauncher = $('<div id="launcher" class="ui black small launch right attached fixed button">'+launcherTitle+'</div>');
var $menu = $('<div class="ui vertical plugin-menu sidebar inverted wide">\n    <div class="header item">\n        <i id="lock" class="icon unlock alternate"></i>\n        相關文章\n    </div>\n\n</div>\n        ');
var $bottomLauncher = $('<div id="launcher" class="ui black small button">'+launcherTitle+'</div>');


// append the DOMs to the body
$body.append($menu);
$body.append($leftLauncher);
//$bottom.after($bottomLauncher);

// move launcher button to be vertically aligned with the article headline
$leftLauncher.css({top: headlineTop});

// create sidebar
$menu
    .sidebar({
        transition       :  'overlay',
        mobileTransition : 'overlay',
        dimPage : false,
        duration: 1,
        onHide: function(event){
            // restore article container margin
            $articleContainer.css('margin', origMargin);
            $articleContainer.css('margin-left', origMarginLeft);
            // show the launcher button
            $leftLauncher.css('display', 'inline');
        }
    });

// set on mouseover handler
[$bottomLauncher, $leftLauncher].forEach(function($launcher){
    $launcher.on('mouseover', function(event) {
        // modify article container margin if needed
        /*if(modifyContentMargin) {
         $articleContainer.css('margin-left', '410px');
         }*/
        $menu.sidebar('show');
        $leftLauncher.hide();
        event.preventDefault();
    });
});

$(window).on("scroll", function(e) {
    console.log($body.scrollTop());
    if ($body.scrollTop() > headlineTop) {
        $leftLauncher.addClass("fixed-top");
        $leftLauncher.css({top: launcherTopPos});

    } else {
        $leftLauncher.removeClass("fixed-top");
        $leftLauncher.css({top: headlineTop});
    }

});

$.ajax
({
    type: "POST",
    //the url where you want to sent the userName and password to
    url: 'https://lifestreams.smalldata.io/ptt/search',
    async: false,
    //json object to sent to the authentication url
    data: JSON.stringify(request),
    success: function (ret) {

        // populate return related articles and comments into the sidebar
        if(ret.articles.length > 0){
            ret.articles.forEach(function(e){
                var board_id = e.id.split(":");
                var board = board_id[0];
                var file = board_id[1] + ".html";
                var href = 'https://www.ptt.cc/bbs/'+ board + '/'+ file;
                var title = e.title ? e.title : e.subject;
                var ago = moment(e.last_modified).locale("zh-tw").fromNow();
                var popup = e.author + '於' + board + '板 ' + ago ;
                $('<a class="post item r-ent" target="_black" href="' + href + '" data-content="' + popup + '"></a>')
                    //.append('<span class="hl f3">'+ e.popularity + '</span>')
                    .append(e.popularity > 50? '<span class="f1 hl">爆</span>' : '')
                    .append('<span class="ui title">' + title +'</span>')
                    .append('<span class="ui date detail"> ' + ago +'</span>')
                    .appendTo($menu);
            });
        }
        if(ret.comments){
            var header = $('<div class="header item"><i class="comment icon"></i>相關評論 -<span class="sub header"> '+ret.comments.title+'</span></div>').appendTo($menu);
            ret.comments.pushed.forEach(function(e){
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

        }

        var $lock = $("#lock");
        chrome.storage.local.get({'lock?': 'unlocked'}, function(ret) {
          if(ret["lock?"] == 'locked'){
              $lock.removeClass('unlock').addClass('lock');
              // modify article container margin if needed
              /*if(modifyContentMargin) {
                  $articleContainer.css('margin-left', '410px');
              }*/
              $menu.sidebar('show');
              $leftLauncher.hide();
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
        })


    }
});


