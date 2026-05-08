       Date.prototype.format = function (format) {
           var args = {
               "M+": this.getMonth() + 1,
               "d+": this.getDate(),
               "h+": this.getHours(),
               "m+": this.getMinutes(),
               "s+": this.getSeconds(),
               "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
               "S": this.getMilliseconds()
           };
           if (/(y+)/.test(format))
               format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
           for (var i in args) {
               var n = args[i];
               if (new RegExp("(" + i + ")").test(format))
                   format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
           }
           return format;
       };
       function isMobileDevice() {
            var device = navigator.userAgent ;          
            return (device.indexOf("iPhone")>0||device.indexOf("Android")>0);
        }

        function updateTime() {
            var now = new Date();
            var text = isMobileDevice()
                ? now.format("hh:mm:ss")
                : now.format("yyyy-MM-dd hh:mm:ss");
            document.getElementById("timeDisplay").textContent = text;
        }

        function adjustFrameHeight() {
            var header = document.querySelector(".header-wrapper");
            var footer = document.querySelector(".footer-section");
            var mainFrame = document.querySelector(".mainFrame");
            var height = document.documentElement.clientHeight
                - (header ? header.clientHeight : 0)
                - (footer ? footer.clientHeight : 0)
                -24;
                // 补足footer的padding部分
            if (height < 0) height = 0;
            mainFrame.style.height = height + "px";
        }

        window.addEventListener("load", function () {
            updateTime();
            adjustFrameHeight();
            setInterval(function () {
                updateTime();
                adjustFrameHeight();
            }, 1000);
        });

        window.addEventListener("resize", function () {
            adjustFrameHeight();
            updateTime();
        });