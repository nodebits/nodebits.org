var Stack = require('stack'),
    Creationix = require('creationix'),
    Path = require('path');
    Nog = require('nog');

var blog = Nog(__dirname);
blog.warehouse();

module.exports = Stack.compose(
  Creationix.postReceive("/post-receive", Path.join(__dirname, "/post-receive.sh"), blog.warehouse),
  Creationix.vhost({"nodebits.org": function (req, res, next) {
    res.end("Coming Soon...\n");
  }}),
  blog
);



