(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
        } catch(e) {
            return;
        }

        try {
            // If we can't parse the cookie, ignore it, it's unusable.
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write
        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== undefined) {
            // Must not alter options, thus extending a fresh object...
            $.cookie(key, '', $.extend({}, options, { expires: -1 }));
            return true;
        }
        return false;
    };

}));

function logout(){/*未登陆弹出*/
    $.ajax({
        type: "GET",
        url: "/apis/logout",
        success: function(data){
            if(data.statusCode == 302){
                //window.location.href="login.html";
                var urls = (window.location.href).split('/');
                var urllogin =urls[0]+"//"+urls[2]+"/"+"login.html";
                window.location.href=urllogin;
            }
        },
        error:function (data) {
            console.log(data);
        }
    });
}
/*获取当前用户信息*/
admin_id =$.cookie("admin_id");
/*未填写完成的用户*/
function unAdmin() {
    $.ajax({
        type: "GET",
        url: "/apis/index/unSaveFiles/"+admin_id,
        dataType: "json",
        success: function(e){
            adminshow =$.cookie("administrator");
            $(".head-admin").text("当前用户:"+adminshow);//登陆
            if(e.statusCode == 302){
                var urls = (window.location.href).split('/');
                var urllogin =urls[0]+"//"+urls[2]+"/"+"login.html";
                window.location.href=urllogin;
            }
            for(var i=0; i<e.data.length; i++){
                var unbegin = "<li><span class='home-right-work-l'>"+(i+1)+"</span><a class='weiwc' data='"+e.data[i].id+"' href='/templates/document/new-document1.html'>"+e.data[i].name+"<span class='shenfen'>身份证:"+e.data[i].cardNum+"</span>"+"</a><span class='home-right-work-r'>未保存</span></li>";
                $(".home-right-work ul.home-right-work-2").append(unbegin);
            }
        }
    });
}
unAdmin();
/*弹窗封装*/
function opentc(text,time) {
    $("body").append("<div class='opens-win'>"+text+"<div>");
    var EndTime= 4;
    var times =setInterval(function () {
        EndTime --;
        if(parseInt(EndTime) ==0){
            clearTimeout(times);
            $(".opens-win").remove();
        }
    },time);
}
/*权限管理*/
function limits(id) {
    $.ajax({
        type: "GET",
        url: "/apis/user/identity/"+id,
        dataType: "json",
        success: function(e){
            console.log(e.data)
        }
    });
}
limits(admin_id);

