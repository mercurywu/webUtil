;(function (window, doc, factory) {
    factory = factory(window, doc);

    window.webUtil = window.webUtil || factory;

})(window, document, function (window, doc) {
    // 工具集
    var webUtil = {
        // 根据命名空间执行init方法
        run: function (namespaceStr) {
            if (!namespaceStr) {
                return;
            }
            var namespaceArr = namespaceStr.split('.');
            var obj = window;
            for (var i = 0, len = namespaceArr.length; i < len; i++) {
                if (!obj[namespaceArr[i]]) {
                    return;
                }
                obj = obj[namespaceArr[i]];
            }
            typeof obj.init === 'function' && obj.init();
        },
        /*
         * 创建命名空间
         * @param {string} namespaceStr 命名空间名称
         * @param {object} newObj 匿名函数
         * @return {object} 返回命名好了的空间
         * */
        namespace: function (namespaceStr, newObj) {
            if (!namespaceStr) {
                return;
            }
            var namespaceArr = namespaceStr.split('.');
            var obj = window;
            for (var i = 0, len = namespaceArr.length; i < len; i++) {
                if (!obj[namespaceArr[i]]) {
                    if (newObj !== undefined && i == len - 1) {
                        obj = obj[namespaceArr[i]] = newObj;
                        break;
                    }
                    obj[namespaceArr[i]] = {};
                }
                obj = obj[namespaceArr[i]];
            }
            return obj;
        },
        // 获取url参数键值对，返回是对象，此方法有缓存功能
        getUrlKeyValObj: function () {
            var url = window.location.search,
                arr, i, len,
                paramsObj = {};
            //判断有无缓存键值对对象
            if (this.getUrlKeyValObj.urlKeyValObj) {
                return this.getUrlKeyValObj.urlKeyValObj;
            }
            arr = url.substring(1).split('&');
            if (!arr.length) {
                return paramsObj;
            }
            for (i = 0, len = arr.length; i < len; i++) {
                var reg = /(.*)\=(.*)/g,
                    match = reg.exec(arr[i]);
                if (match && match[1]) {
                    paramsObj[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
                }
            }
            this.getUrlKeyValObj.urlKeyValObj = paramsObj;
            return paramsObj;
        },
        // 获取url参数键值对，返回是对象，此方法无缓存功能
        getRequestKey: function () {
            var url = window.location.search,
                theRequest = new Object(),
                strs;
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        /*
         * 获取url的key对应参数的值
         * @param {string} param url参数中的key
         * @return {string} 返回key对应的value
         */
        getUrlValue: function (param) {
            if (!param) {
                return '';
            }
            var paramsObj = this.getUrlKeyValObj();
            if (paramsObj.hasOwnProperty(param)) {
                return paramsObj[param];
            } else {
                return '';
            }
        },
        /*
         * 函数节流
         * @param {function} method	要进行节流的函数
         * @param {number} delay 延时时间(ms)
         * @param {number} duration 经过duration时间(ms)必须执行函数method
         */
        throttle: function (method, delay, duration) {
            var timer = null,
                begin = null;
            return function () {
                var context = this,
                    args = arguments,
                    current = new Date();
                if (!begin) {
                    begin = current;
                }
                if (timer) {
                    window.clearTimeout(timer);
                }
                if (duration && current - begin >= duration) {
                    method.apply(context, args);
                    begin = null;
                } else {
                    timer = window.setTimeout(function () {
                        method.apply(context, args);
                        begin = null;
                    }, delay);
                }
            };
        },
        /*
         * 生成随机ID码
         * @param {number} len 需要随机字符串的长度
         * @param {number} radix 随机范围极限为62
         * @return {string} 生成的字符串
         */
        uuid: function (len, radix) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = [], i;
            radix = radix || chars.length;
            if (len) {
                for (i = 0; i < len; i++) {
                    //  |  是把左右转为二进制再相加再转为十进制，从而取真正的正整数，解决js取值的暗病
                    uuid[i] = chars[0 | Math.random() * radix];
                }
            } else {
                //没有传参则随机，长度为36
                var r;
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }
            return uuid.join('');
        },
        // 获取字节长度
        getByteLength: function (str) {
            //^\x00-\xff为ASCII码中大于255的字符，该正则为检查是否是汉字或者全角，汉字或者全角占2个字节
            return str.replace(/[^\x00-\xff]/g, '**').length;
        },
        /*
         * 根据字节长度截取字符串
         * @param {string} str 目标字符串
         * @param {number} num 需要截取的长度
         * @return {string} 返回截取后的字符串
         */
        getByteVal: function (str, num) {
            var len = 0,
                returnValue = '';
            for (var i = 0, l = str.length; i < l; i++) {
                if (str[i].match(/[^\x00-\xff]/ig) != null) { //全角
                    len += 2;
                } else {
                    len += 1;
                }
                if (len > num) {
                    break;
                }
                returnValue += str[i];
            }
            return returnValue;
        },
        // 转义特殊字符<,>,",&
        escape: function (str) {
            if (!str) {
                return '';
            }
            var escape = {
                '<': '&lt;',
                '>': '&gt;',
                '\"': '&quot;',
                '&': '&amp;'
            };
            return str.replace(/[&<>"]/g, function (match) {
                return escape[match] || match;
            });
        },
        // 获取上传文件大小 兼容IE9低版本
        getFileSize: function (obj){
            var filesize;
            if(obj.files){
                filesize = obj.files[0].size;
            }else{
                try{
                    var path,fso; 
                    path = document.getElementById('filePath').value;
                    fso = new ActiveXObject("Scripting.FileSystemObject"); 
                    filesize = fso.GetFile(path).size; 
                }
                catch(e){
                    // 在IE9及低版本浏览器，如果不容许ActiveX控件与页面交互，点击了否，就无法获取size
                    console.log(e.message); // Automation 服务器不能创建对象
                    filesize = 'error'; // 无法获取
                }
            }
            return filesize;
        },
        /*
         * 检测是否电脑端/移动端
         */
        versions: function(){
            var u = navigator.userAgent, app = navigator.appVersion;
            var sUserAgent = navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1,
                presto: u.indexOf('Presto') > -1, 
                isChrome: u.indexOf("chrome") > -1, 
                isSafari: !u.indexOf("chrome") > -1 && (/webkit|khtml/).test(u),
                isSafari3: !u.indexOf("chrome") > -1 && (/webkit|khtml/).test(u) && u.indexOf('webkit/5') != -1,
                webKit: u.indexOf('AppleWebKit') > -1, 
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), 
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), 
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                iPhone: u.indexOf('iPhone') > -1, 
                iPad: u.indexOf('iPad') > -1,
                iWinPhone: u.indexOf('Windows Phone') > -1
            };
        },
        /*
         * 检测浏览器内核
         */
        getInternet: function (){    
            if(navigator.userAgent.indexOf("MSIE")>0) {    
              return "MSIE";       //IE浏览器  
            }  
            if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){    
              return "Firefox";     //Firefox浏览器  
            }  
            if(isSafari=navigator.userAgent.indexOf("Safari")>0) {    
              return "Safari";      //Safan浏览器  
            }  
            if(isCamino=navigator.userAgent.indexOf("Camino")>0){    
              return "Camino";   //Camino浏览器  
            }  
            if(isMozilla=navigator.userAgent.indexOf("Gecko/")>0){    
              return "Gecko";    //Gecko浏览器  
            }    
        },
        /*
         * 表单右侧提示
         * @_this {object} 目标对象
         * @tipFlag {boolean} 是否正确
         * @_contents {string} 提示内容
         */
        inputRightTips: function(_this, tipFlag, _contents){
            var pos = { x: _this.offset().left, y: _this.offset().top };
            var wh = { w: _this.outerWidth(), h: _this.outerHeight() };
            var setPos = {
                x: pos.x + wh.w + 10,
                y: pos.y - (_this.outerHeight() - wh.h)/2
            };
            var truePic = "bingo.png";
            var falsePic = "bingo.png";
            var tipsBox = '<span class="input-tips-span" style="left:' +
                setPos.x + 'px;top:' + setPos.y + 'px">' +
                '<img src="' + (tipFlag?truePic:falsePic) + '" />' +
                _contents +
                '</span>';
            var haveTips = _this.parent().find('.input-tips-span');
            if(haveTips.length){
                haveTips.remove();
            }
            _this.after(tipsBox);
        },
        //错误提示
        tips: function (msg) {
            $('.ui-tips').remove();
            var $tips = $('<div class="ui-tips floatin"></div>');
            $tips.html(msg).appendTo('body');
            //css
            //			.ui-tips{
            //				width: 200px;
            //				padding: 10px 20px;
            //				background: #36AEEE;
            //				color: #fff;
            //				text-align: center;
            //				position: fixed;
            //				top: 0;
            //				left: 0;
            //				right: 0;
            //				margin: auto;
            //				z-index: 999;
            //				border-radius: 4px;
            //				box-sizing: content-box;
            //			}
            //
            //			.floatin{
            //				animation: floatin 3s forwards;
            //			}
            //
            //@keyframes floatin{
            //				0%{
            //					transform: translateY(-100%);
            //			}
            //				10%, 90%{
            //					transform: translateY(0);
            //			}
            //				100% {
            //					transform: translateY(-100%);
            //			}
            //			}
            //
            //			.fadein{
            //				animation: fadein 400ms forwards;
            //			}
            //
            //			.fadeout{
            //				animation: fadeout 400ms forwards;
            //			}
            //
            //@keyframes fadein{
            //				from{
            //					opacity: 0;
            //				} to {
            //					opacity: .5;
            //				}
            //			}
            //
            //@keyframes fadeout{
            //				from{
            //					opacity: .5;
            //				} to {
            //					opacity: 0;
            //				}
            //			}
            //
            //			.zoomin{
            //				animation: zoomin 150ms ease-out forwards;
            //			}
            //
            //@keyframes zoomin{
            //				0%{
            //					transform: translate(-50%, -50%) scale(1.1);
            //			}
            //				100%{
            //					transform: translate(-50%, -50%) scale(1);
            //			}
            //			}
        },
        //表单字数限制
        isNotMax: function(oTextArea){
            var val = oTextArea.value;
            var maxLength = oTextArea.getAttribute('maxlength');
            var len = 0;
            var theLength = 0;
            for (var i = 0; i < val.length; i++) {
                if (val.charCodeAt(i) > 255) {
                    len += 2;
                    theLength += 1;
                }
                else {
                    len += 1;
                    theLength += 1;
                }
            }
            if(!(len <= oTextArea.getAttribute("maxlength"))){
                oTextArea.value = oTextArea.value.substring(0,(theLength - (len-maxLength)/2));
            };
        },
        /*************************ajax封装区***************************/
        //原生ajax封装
        ajaxNative: function (opt) {//opt{url: ,method: ,data:{}, success: function(){}, error: function(){}}
            //创建 - 非IE6 - 第一步
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else { //IE6及其以下版本浏览器
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
            //连接 和 发送 - 第二步
            if (opt.type === "GET") {
                xhr.open("GET", opt.url, true);
                xhr.send(null);
            } else if (opt.type === "POST") {
                xhr.open("POST", opt.url, true);
                //设置表单提交时的内容类型
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
                xhr.send(opt.data || null);
            }
            //接收 - 第三步
            xhr.addEventListener("readystatechange", function () {
                if (xhr.readyState == 4) {
                    var status = xhr.status;
                    if (status >= 200 && status < 300) {
                        opt.success && opt.success(xhr.responseText);
                    } else {
                        opt.error && opt.error(xhr.status);
                    }
                }
            });
        },
        /*
         * jq版ajax封装
         * @param {string} url 接口
         * @param {string} type 接口类型 post / get
         * @param {boolean} async 是否异步 true / false
         * @param {object} data 选传项，type为post时要传的object
         */
        ajaxJquery: function (url, type, async, data) {
            var deferred = $.Deferred();
            $.ajax({
                url: url,
                type: type,
                data: data,
                async: async
            }).always(function (resp) {
                if (resp && resp.success === true) {
                    deferred.resolve(resp);
                } else {
                    deferred.reject(resp);
                }
            });
            return deferred.promise();
        },
        /*************************表单数据校验区***************************/
        /*
         * 校验集合
         * @param {array} arr 对象数组
         * 数组项的object结构为
         * {type:'phone/null/checkpwd/email/minAndMax/letterNumber/json',
		 * 	field:'需要校验的对象',
		 * 	Additional:'可选项，看每个校验的需要',
		 * 	tips:'错误提示',
		 * }
         * @return {string} 返回截取后的字符串
         */
        validateGather: function (arr) {
            for (var item = 0; item < arr.length; item++) {
                var thisItem = arr[item];
                switch (thisItem.type) {
                    case 'phone':
                        this.phoneValidate(thisItem.field, thisItem.tips);
                        break;
                    case 'null':
                        this.nullValidate(thisItem.field, thisItem.tips);
                        break;
                    case 'checkpwd':
                        this.checkpwdValidate(thisItem.field1, thisItem.field2, thisItem.tips);
                        break;
                    case 'email':
                        this.emailValidate(thisItem.field, thisItem.tips);
                        break;
                    case 'minAndMax':
                        this.minAndMaxValidate(thisItem.field, thisItem.min, thisItem.max, thisItem.tips);
                        break;
                    case 'letterNumber':
                        this.letterNumberValidate(thisItem.field, thisItem.tips);
                        break;
                    case 'json':
                        this.jsonValidate(thisItem.field, thisItem.tips);
                        break;
                }
            }
        },
        //表单非空判断
        inputNullValidate: function (_this, _set) {
            if (_this.val() == null || _this.val() == "") {
                this.noteTips(_this, _set);
                return false
            } else {
                return true
            }
        },

        //非空判断
        nullValidate: function (field) {
            if (field.val() == null || field.val() == "") {
                return false
            } else {
                return true
            }
        },
        //检验位数
        minAndMaxValidate: function (field, min, max) {
            if (field.val().length >= min) {
                if (field.val().length <= max) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        //校验手机号码
        phoneValidate: function (field) {
            var pattern = /(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
            if (!pattern.test(field.val())) {
                return false
            } else {
                return true
            }
        },
        //校验英文数字组合
        letterNumberValidate: function (field) {
            if (!/^(?=.*[a-z])[a-zA-Z0-9]+/ig.test(field.val())) {
                return false;
            } else {
                return true;
            }
        },
        //数字开头
        notNumStartValidate: function (field) {
            if (/^[0-9]+.*/ig.test(field.val())) {
                return true;
            } else {
                return false;
            }
        },
        //判断两次密码相同（注册和修改密码时用于确认）
        checkpwdValidate: function (field1, field2) {
            if (field1.val() != field2.val()) {
                return false
            } else {
                return true
            }
        },
        //校验邮箱
        emailValidate: function (field) {
            var pattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!pattern.test(field.val())) {
                return false
            } else {
                return true
            }
        },

        //空格校验
        spaceValidate: function(field){
            var pattern = /^[^\s]+$/g;
            if (!pattern.test(field.val())) {
                return false
            } else {
                return true
            }
        },
        // 判断只为数字、英文、"."、"/"
        englishAndNumberCheck: function(str){
            var reg = /[^\x2e-\x39\x41-\x5a\x61-\x7a]/g
            return (!reg.test(str));
        },
        // 判断只为数字
        numberCheck: function(str){
            var reg = /[^\x30-\x39]/g
            return (!reg.test(str));
        },

        //json格式校验
        jsonValidate: function (field, tips) {
            var data = field.val();
            try {
                JSON.parse(data);
            } catch (e) {
                this.tips(tips);
                console.log(e);
                return false;
            }
            field.val(data);
            return true;
        },
        // 简单模板拼装
        Template: function () {
            this.arr = [];
            this._pushAll(arguments);
        },
    };

    webUtil.Template.prototype = {
        constructor: webUtil.Template,

        _: function () {
            this._pushAll(arguments);
            return this;
        },

        toString: function () {
            return this.arr.join('');
        },

        _pushAll: function (arguments) {
            var args = [].slice.call(arguments);
            this.arr = this.arr.concat(args);
        },

        clean: function () {
            this.arr = [];
            return this;
        }
    };

    return webUtil;
});