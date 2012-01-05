One of the goals of nodebits is to provide simple and easy to understand projects that can be taken apart and tinkered with. Click on the `sample-app` category link on the right to find other articles like this in the future.

In this edition, we will stack up a simple server that takes your filesystem and hoists it up on the internet via HTTP.  You can download and browse files using `GET` requests and (when authenticated) `DELETE` files and `PUT` new files.

To keep things basic, we won't be using [ExpressJS][] or even [Connect][].  We'll be using simpler versions of those libraries, [Stack][] and [Creationix][].  Originally I developed these simpler versions both to scratch an itch and to run web servers on mobile phones.

## Getting Started With a New App

Normally you would start by installing [NodeJS][], [npm][], and [git][] and then running `git init` in a new folder.  A nifty feature of this site is that the example code for all articles is already in [git][] and you can edit and run the code directly in your browser.

First we'll create a `package.json` file so that we can declare our dependencies.

    #@git://github.com/nodebits/file-hoister.git#package.json

Here I filled in the minimal fields to get started.  The only optional field was the `private` field.  This is good for apps that aren't themselves libraries to be published to the npm repository.

## Step Zero - An HTTP Server

As a setup step, let's get a web server up and running.  We want to use the Stack and Creationix libraries to help us so we'll make a single-layer stack that logs all requests and responds with 404 codes.

    #@git://github.com/nodebits/file-hoister.git#step0.js

Run this server, and then to test it, hit it with curl:

    $ curl -i http://localhost:3000/
    HTTP/1.1 404 Not Found
    Content-Type: text/plain
    Date: Thu, 05 Jan 2012 06:21:38 GMT
    Server: NodeJS v0.6.6
    X-Runtime: 0
    Connection: keep-alive
    Transfer-Encoding: chunked

    Not Found

The server window has the output:

    Serving /path/to/file-hoister at http://localhost:3000/
    GET / 404 Content-Type=text/plain

Congratulations, you now have a working (and more importantly extensible) webserver running!

-------------

## Step One - Serving Files

This step is pretty easy.  There are many modules on npm that serve files for node.  Most of them are Connect and Stack compatible (meaning they follow the `(req, res, next)` signature for request handlers).  For this exercise, we'll use the ones built into the Creationix module, `Static` and `Indexer`.  Let's just add them into the stack configuration and we're done!

    #@git://github.com/nodebits/file-hoister.git#step1.js,13-17

[Indexer][] will match against requests to directories and render a nice html directory listing.

[Static][] will match against requests for files.  If the file exists, it will look up its mime type, send the right headers, and stream it to the browser.  Also it will respond with 304 Not Modified responses using timestamps and `Last-Modified` headers.

Any request that falls through both layers will return a 404 Not Found response.

Go ahead.  Run this new version and see your file listing and contents in your browser!

## Step Two - Security and Encryption

Serving in plain text over HTTP is fine for public information and read-only content, but we want more.  So before I show you how to upload and delete files, we will set up some security.  The first step to making a secure website is to use HTTPS.  In node this means providing a certificate and switching to the HTTPS module instead of HTTP.

To create a certificate, follow the instructions in the [tls][] section of the docs.  I've created a self-signed certificate and put it in the repo. (It's not actually secure if you check your private key into a public repo like this.)

Ok, now to adjust the server to use https.  One change is to swap which module we're loading and add in the FS module for loading the cert. We'll also need to load the certificate files into an options object to pass into the `HTTPS.createServer` call.  Here is the new complete code listing after converting it to using HTTPS with a self-signed certificate.

    #@git://github.com/nodebits/file-hoister.git#step2.js

When you make a request to this server with a browser, you'll probably get a nasty warning about it not being trusted.  If you're sure it's your server, then it's quite secure.  It's just not safe for servers in the wild to use self-signed certificates because they could be impostors.

## Step Three - Authentication and Authorization

Having a strongly encrypted connection alone isn't enough to make your site safe.  We also need to authenticate users and then authorize them for specific tasks.  To do this, we'll use HTTP basic auth and some simple objects to store data.

For username password combos, we'll just store them in the clear within the source.  Don't do this in a real website! But for streaming movies over your home network, it's probably fine.

    #@git://github.com/nodebits/file-hoister.git#step3.js,20-23

And then to authorize these users to various privileges, use another object:

    #@git://github.com/nodebits/file-hoister.git#step3.js,26-30

Then we'll use the [auth] module to handle the nitty-gritty details for us.  It's configured with  a callback that, when given a username, password, and request object, will return with a valid username or false.

    #@git://github.com/nodebits/file-hoister.git#step3.js,33-38

Now all HTTP requests are required to be authenticated and will fail if the given HTTP verb is not allowed for that user.

## Step Four - Writing to the Filesystem

Ok, now that the essential security precautions are in place, let's allow web requests to write to our filesystem.  

This is actually quite simple by using a couple other built-in parts to the Creationix module, uploader and deleter.

    #@git://github.com/nodebits/file-hoister.git#server.js,41-48

[Uploader][] will match against `PUT` requests and stream the raw request body to a file in the filesystem.

[Deleter][] will match against request with the `DELETE` verb and delete the matched file in the filesystem.

With this, you're done!  As homework, turn this into a command-line tool for quickly hoisting a filesystem to the network for quick filesharing.  There are great node modules for option parsing.  Also feel free to use other libraries.  These were used because their code is fairly short and to the point.

[tls]: http://nodejs.org/docs/v0.6.6/api/tls.html#tLS_
[Indexer]: https://github.com/creationix/creationix/blob/master/indexer.js
[Static]: https://github.com/creationix/creationix/blob/master/static.js
[Uploader]: https://github.com/creationix/creationix/blob/master/uploader.js
[Deleter]: https://github.com/creationix/creationix/blob/master/deleter.js
[auth]: https://github.com/creationix/creationix/blob/master/auth.js
[git]: http://git-scm.com/
[NodeJS]: http://nodejs.org/
[npm]: http://npmjs.org/
[ExpressJS]: http://expressjs.com/
[Connect]: http://senchalabs.github.com/connect/
[Stack]: http://github.com/creationix/stack
[Creationix]: http://github.com/creationix/creationix
[git repo]: https://github.com/nodebits/file-hoister