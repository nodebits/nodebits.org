var Stack = require('stack'),
    Creationix = require('creationix'),
    Path = require('path');
    Nog = require('nog');

var blog = Nog(__dirname);
blog.warehouse();

module.exports = Stack.compose(
  Creationix.postReceive("/post-receive", Path.join(__dirname, "/post-receive.sh"), blog.warehouse),
  Creationix.vhost({"nodebits.org": function (req, res, next) {
    if (req.url !== "/feed.xml") {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.end("Coming Soon...\n");
    } else {
      next();
    }
  }}),
  blog
);



