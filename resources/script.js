document.addEventListener('load', function (evt) {
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
}, true);
