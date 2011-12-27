document.addEventListener('load', function (evt) {
  var form = document.getElementById("searchbox");
  if (!form) return;
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
}, true);

function activate(id, data) {
  var root = document.getElementById(id);
  var live = root.querySelector('div.json');
  var json = live.textContent;
  var code = root.querySelector('pre.code');
  var outputPre = root.querySelector('pre.output');
  outputPre.setAttribute('style', 'display:block');
  var output = outputPre.querySelector('code');
  var data = JSON.parse(json).reverse();
  output.textContent = "";
  var start;
  function step() {
    var next = data.pop();
    if (!next) return;
    if (next.start) {
      start = next.start;
      return step();
    }
    if (next.hasOwnProperty('delay')) {
      setTimeout(function () {
        var node = document.createElement('span');
        if (next.stdout) {
          node.setAttribute("class", "stdout");
          node.textContent = next.stdout;
        }
        if (next.stderr) {
          node.setAttribute("class", "stderr");
          node.textContent = next.stderr;
        }
        output.appendChild(node);
        outputPre.scrollTop = outputPre.clientHeight;
        step();
      }, next.delay);
      return;
    }
    console.log("next", next);
  }
  step();
}
