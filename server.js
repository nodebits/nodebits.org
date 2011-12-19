var Http = require('http'),
    Stack = require('stack'),
    Creationix = require('creationix'),
    Path = require('path');
    Nog = require('nog');

var port = process.env.PORT || 8080;

Http.createServer(Stack(
  Creationix.log(),
  Nog(Path.join(__dirname, "nodebits.org"))
)).listen(port);
console.log("Server listening at http://localhost:%s/", port);


