!function(){"use strict";function t(t){this.a=c,this.b=void 0,this.d=[];var e=this;try{t(function(t){i(e,t)},function(t){o(e,t)})}catch(n){o(e,n)}}function e(e){return new t(function(t,n){n(e)})}function n(e){return new t(function(t){t(e)})}function i(t,e){if(t.a===c){if(e===t)throw new TypeError("Promise resolved with itself.");var n=!1;try{var r=e&&e.then;if(null!==e&&"object"==typeof e&&"function"==typeof r)return void r.call(e,function(e){n||i(t,e),n=!0},function(e){n||o(t,e),n=!0})}catch(a){return void(n||o(t,a))}t.a=0,t.b=e,s(t)}}function o(t,e){if(t.a===c){if(e===t)throw new TypeError("Promise rejected with itself.");t.a=1,t.b=e,s(t)}}function s(t){setTimeout(function(){if(t.a!==c)for(;t.d.length;){var e=t.d.shift(),n=e[0],i=e[1],o=e[2],e=e[3];try{0===t.a?o("function"==typeof n?n.call(void 0,t.b):t.b):1===t.a&&("function"==typeof i?o(i.call(void 0,t.b)):e(t.b))}catch(s){e(s)}}},0)}function r(e){return new t(function(t,n){function i(n){return function(i){s[n]=i,o+=1,o===e.length&&t(s)}}var o=0,s=[];0===e.length&&t(s);for(var r=0;r<e.length;r+=1)e[r].c(i(r),n)})}function a(e){return new t(function(t,n){for(var i=0;i<e.length;i+=1)e[i].c(t,n)})}var c=2;t.prototype.e=function(t){return this.c(void 0,t)},t.prototype.c=function(e,n){var i=this;return new t(function(t,o){i.d.push([e,n,t,o]),s(i)})},window.Promise||(window.Promise=t,window.Promise.resolve=n,window.Promise.reject=e,window.Promise.race=a,window.Promise.all=r,window.Promise.prototype.then=t.prototype.c,window.Promise.prototype["catch"]=t.prototype.e)}(),function(){"use strict";function t(t){this.a=document.createElement("div"),this.a.setAttribute("aria-hidden","true"),this.a.appendChild(document.createTextNode(t)),this.b=document.createElement("span"),this.c=document.createElement("span"),this.f=document.createElement("span"),this.e=document.createElement("span"),this.d=-1,this.b.style.cssText="display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;",this.c.style.cssText="display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;",this.e.style.cssText="display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;",this.f.style.cssText="display:inline-block;width:200%;height:200%;",this.b.appendChild(this.f),this.c.appendChild(this.e),this.a.appendChild(this.b),this.a.appendChild(this.c)}function e(t,e,n){t.a.style.cssText="min-width:20px;min-height:20px;display:inline-block;position:absolute;width:auto;margin:0;padding:0;top:-999px;left:-999px;white-space:nowrap;font-size:100px;font-family:"+e+";"+n}function n(t){var e=t.a.offsetWidth,n=e+100;return t.e.style.width=n+"px",t.c.scrollLeft=n,t.b.scrollLeft=t.b.scrollWidth+100,t.d!==e?(t.d=e,!0):!1}function i(t,e){t.b.addEventListener("scroll",function(){n(t)&&null!==t.a.parentNode&&e(t.d)},!1),t.c.addEventListener("scroll",function(){n(t)&&null!==t.a.parentNode&&e(t.d)},!1),n(t)}function o(t,e){this.family=t,this.style=e.style||"normal",this.variant=e.variant||"normal",this.weight=e.weight||"normal",this.stretch=e.stretch||"stretch",this.featureSettings=e.featureSettings||"normal"}var s=null;o.prototype.a=function(n,o){var r=n||"BESbswy",a=o||3e3,c="font-style:"+this.style+";font-variant:"+this.variant+";font-weight:"+this.weight+";font-stretch:"+this.stretch+";font-feature-settings:"+this.featureSettings+";-moz-font-feature-settings:"+this.featureSettings+";-webkit-font-feature-settings:"+this.featureSettings+";",l=document.createElement("div"),f=new t(r),h=new t(r),d=new t(r),u=-1,p=-1,w=-1,m=-1,y=-1,v=-1,b=this;return e(f,"sans-serif",c),e(h,"serif",c),e(d,"monospace",c),l.appendChild(f.a),l.appendChild(h.a),l.appendChild(d.a),document.body.appendChild(l),m=f.a.offsetWidth,y=h.a.offsetWidth,v=d.a.offsetWidth,new Promise(function(t,n){function o(){null!==l.parentNode&&document.body.removeChild(l)}function r(){if(-1!==u&&-1!==p&&-1!==w&&u===p&&p===w){if(null===s){var e=/AppleWeb[kK]it\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);s=!!e&&(536>parseInt(e[1],10)||536===parseInt(e[1],10)&&11>=parseInt(e[2],10))}s?u===m&&p===m&&w===m||u===y&&p===y&&w===y||u===v&&p===v&&w===v||(o(),t(b)):(o(),t(b))}}setTimeout(function(){o(),n(b)},a),i(f,function(t){u=t,r()}),e(f,b.family+",sans-serif",c),i(h,function(t){p=t,r()}),e(h,b.family+",serif",c),i(d,function(t){w=t,r()}),e(d,b.family+",monospace",c)})},window.FontFaceObserver=o,window.FontFaceObserver.prototype.check=o.prototype.a}(),function(t){if(!(t.document.documentElement.className.indexOf("fonts-loaded")>-1)){var e=new t.FontFaceObserver("Open Sans",{});t.Promise.all([e.check()]).then(function(){t.document.documentElement.className+=" fonts-loaded"})}}(this);