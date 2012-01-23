var Stack = require('stack'),
    Creationix = require('creationix'),
    Path = require('path');
    Nog = require('nog');

var blog = Nog(__dirname);
blog.warehouse();

module.exports = Stack(
  Creationix.postReceive("/post-receive", Path.join(__dirname, "/post-receive.sh"), blog.warehouse),
  blog
);



