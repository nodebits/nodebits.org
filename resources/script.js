
// https://github.com/creationix/dombuilder minified
(function(){function f(a){return a.substr(1)}function b(a,b){var c=Object.keys(b);for(var d=0,e=c.length;d<e;d++){var f=c[d];a[f]=b[f]}}function a(a,c){var d=Object.keys(c);for(var e=0,f=d.length;e<f;e++){var g=d[e],h=c[g];g==="$"?h(a):g==="css"?b(a.style,h):g.substr(0,2)==="on"?a.addEventListener(g.substr(2),h,!1):a.setAttribute(g,h)}}this.domBuilder=function g(b,h){if(typeof b=="string")return document.createTextNode(b);var i,j;for(var k=0,l=b.length;k<l;k++){var m=b[k];if(!i){if(typeof m=="string"){var n=m.match(TAG_MATCH);n=n?n[0]:"div",i=document.createElement(n),j=!0;var o=m.match(c);o&&i.setAttribute("class",o.map(f).join(" "));var p=m.match(d);p&&i.setAttribute("id",p[0].substr(1));var q=m.match(e);h&&q&&(h[q[0].substr(1)]=i);continue}i=document.createDocumentFragment()}j&&typeof m=="object"&&m.__proto__===Object.prototype?a(i,m):i.appendChild(g(m,h)),j=!1}return i};var c=/\.[^.#$]+/g,d=/#[^.#$]+/,e=/\$[^.#$]+/;TAG_MATCH=/^[^.#$]+/})();

// Make an HTTP GET request and parse the resulting JSON
// Callback is (err, object) where err is any error and object is the parsed JSON
function getJSON(url, callback) {
  if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    httpRequest = new XMLHttpRequest();
  } else if (window.ActiveXObject) { // IE
    try { httpRequest = new ActiveXObject("Msxml2.XMLHTTP"); } 
    catch (e) {
      try { httpRequest = new ActiveXObject("Microsoft.XMLHTTP"); } 
      catch (e) { return callback(new Error("No XHR in this browser")); }
    }
  }

  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var object;
        try {
          object = JSON.parse(httpRequest.responseText);
        } catch (err) {
          return callback(err);
        }
        callback(null, object);
      } else if (httpRequest.status === 404) {
        var err = new Error("Cannot find requested resource " + JSON.stringify(url));
        err.code = "ENOENT";
        return callback(err);
      } else {
        return callback(new Error("There was a problem with the request."));
      }
    }
  };
  httpRequest.open('GET', url);
  httpRequest.send();
}

window.addEventListener('load', function (evt) {
  var form = document.getElementById("searchbox");
  var input = form.query;
  form.onsubmit = function (evt) {
    var query = input.value;
    if (query) {
      input.value = "";
      input.blur();
      alert("TODO: query " + query);
    }
    return false;
  };
  
  var dropdown = document.querySelector("select.filter-dropdown");
  console.log("dropdown", dropdown);
  dropdown.addEventListener('change', function (evt) {
    document.location = "/?node_version=" + dropdown.value;
  }, true);
  
  var snippets = document.querySelectorAll("div.snippet");
  Array.prototype.forEach.call(snippets, function (root) {
    var snippetPath = root.getAttribute('source');
    var code = root.querySelector("code").textContent;
    var $ = {};
    var contents = domBuilder([
      ["pre$scroller", {"class": "output"}, ["code$output"]],
      ["div", {style: "text-align:right"},
        ["button", {onclick: run}, "Run this Snippet"],
        ["button", {onclick: edit}, "Edit in Cloud9"],
      ],
    ], $);
    root.appendChild(contents);
    
    function run() {
      $.output.textContent = "Loading...";
      $.scroller.setAttribute('style', 'display:block');
      getJSON("/snippets/" + snippetPath, function (err, data) {
        if (err) {
          $.output.textContent = err.stack;
          throw err;
        }
        $.output.textContent = "> node " + snippetPath + "\n";
        var start;
        step();
        function step() {
          var next = data.pop();
          if (!next) return;
          if (next.start) {
            start = next.start;
            return step();
          }
          if (next.hasOwnProperty('delay')) {
            setTimeout(function () {
              var node;
              if (next.stdout) {
                node = domBuilder(["span", {"class":"stdout"},
                  next.stdout
                ]);
              } else if (next.stderr) {
                node = domBuilder(["span", {"class":"stderr"},
                  next.stderr
                ]);
              } else if (next.timeout) {
                node = domBuilder(["span", {"class":"timeout",title:"Process was still alive at this point."},
                  "..."
                ]);
              } else if (next.hasOwnProperty("exit")) {
                node = domBuilder(["span", {"class":"exit",title:"Process Exited."},
                  "Exit."
                ]);
              } else {
                console.log("next", next)
                throw new Error("Unknown type " + next);
              }
              $.output.appendChild(node);
              $.scroller.scrollTop = $.scroller.clientHeight;
              step();
            }, next.delay);
            return;
          }
          console.log("next", next)
          throw new Error("Unknown type " + next);
        }

      });
      // var root = document.getElementById(id);
      // var code = root.querySelector('pre.code');
      // var outputPre = root.querySelector('pre.output');
      // var output = outputPre.querySelector('code');
      // var data = JSON.parse(json).reverse();
      // var script = live.getAttribute('script');
    }
    function edit() {
      alert("TODO: integrate with c9.io");
    }
  });
  
}, true);
