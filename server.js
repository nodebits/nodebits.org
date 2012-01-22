var Http = require('http'),
    Stack = require('stack'),
    Creationix = require('creationix');

var port = process.env.PORT || 8081;

Http.createServer(Stack(
  Creationix.log(),
  require('./app')
)).listen(port);
console.log("Server listening at http://localhost:%s/", port);



