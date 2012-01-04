
// http://github.com/creationix/dombuilder
(function(){function f(a){return a.substr(1)}function b(a,b){var c=Object.keys(b);for(var d=0,e=c.length;d<e;d++){var f=c[d];a[f]=b[f]}}function a(a,c){var d=Object.keys(c);for(var e=0,f=d.length;e<f;e++){var g=d[e],h=c[g];g==="$"?h(a):g==="css"?b(a.style,h):g.substr(0,2)==="on"?a.addEventListener(g.substr(2),h,!1):a.setAttribute(g,h)}}this.domBuilder=function g(b,h){if(typeof b=="string")return document.createTextNode(b);var i,j;for(var k=0,l=b.length;k<l;k++){var m=b[k];if(!i){if(typeof m=="string"){var n=m.match(TAG_MATCH);n=n?n[0]:"div",i=document.createElement(n),j=!0;var o=m.match(c);o&&i.setAttribute("class",o.map(f).join(" "));var p=m.match(d);p&&i.setAttribute("id",p[0].substr(1));var q=m.match(e);h&&q&&(h[q[0].substr(1)]=i);continue}i=document.createDocumentFragment()}j&&typeof m=="object"&&m.__proto__===Object.prototype?a(i,m):i.appendChild(g(m,h)),j=!1}return i};var c=/\.[^.#$]+/g,d=/#[^.#$]+/,e=/\$[^.#$]+/;TAG_MATCH=/^[^.#$]+/})()

window.addEventListener('load', loadCallback, true);
window.attachEvent('load', loadCallback, true);

function loadCallback(evt){
  var form = document.getElementById("searchbox");
  var input = form.query;
  form.onsubmit = function (evt) {
    var query = input.value;
    if (query) {
      input.value = "";
      input.blur();
      var url = "https://www.google.com/search?q=" + encodeURIComponent("site:nodebits.org " + query);
      window.open(url);
    }
    return false;
  };

  var dropdown = document.querySelector("select.filter-dropdown");
  dropdown.addEventListener('change', function (evt) {
    document.location = "/?node_version=" + dropdown.value;
  }, true);
}

function snippet(options) {
  var url = options.url;
  var tags = document.querySelectorAll("script");
  var tag;
  for (var i = 0,l = tags.length; i < l; i++) {
    var t = tags[i];
    if (t.getAttribute('src') === url) tag = t;
  }
  if (!tag) return;
  
  var $ = {};
  var pre = domBuilder([
    ["pre.prettyprint",
      ["a.filename", {href: "#IDE", title: "Run in Cloud9IDE"}, options.query.file],
      ["code$code"]
    ]
  ], $);
  $.code.innerHTML = options.html;
  tag.parentNode.replaceChild(pre, tag);
}

