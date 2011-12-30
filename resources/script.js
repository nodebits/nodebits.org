
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
  dropdown.addEventListener('change', function (evt) {
    document.location = "/?node_version=" + dropdown.value;
  }, true);

}, true);
