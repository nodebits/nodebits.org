In celebration of the official launch of Nodebits.org (<http://c9.io/blog-entry>), we’re introducing Nodebits’ first official contest – The Great Wiki Challenge. 

## The Rules

Ok, the goal of this contest is simple.  Take this basic wiki (explained below) and turn it into something beautiful.  The sky is the limit.  You can add whatever features you think make for an awesome wiki.

The completed entry needs to be runnable in the [Cloud9][] development environment.  Simply start by clicking on any of the "Edit in Cloud9" links on the code snippets and this git repo will automatically be cloned into your personal c9.io environment (don't worry, it's free).  From there you can develop your additions and test your code.

### Submitting an Entry

The due date for entries is the close of Node Summit.  Your entry must be made before the conference ends on Wednesday evening in San Francisco.  Simply tag your git repository with `wiki-contest` and tweet a link to your c9.io project to @nodebits.

### Judging

We will judge entries on the following criteria:

 - *Creativity* - Make it something neat.  Think outside the box.  Have fun.
 - *Beauty* - Both the final interface and the source code that generates it should be pleasing to the eye.
 - *Usefulness* - What good is a tool if it's not useful to anyone.  Make it actually useful too.
 - *Simplicity* - This is an often overlooked trait in software.  Yes it often competes with the other goals, but it's a goal that must always be kept in mind.  The code shouldn't be any more complicated than necessary.  The user interface should be simple *and* easy to understand. 

### Prizes

I'm sure all of you don't need a prize to help motivate you in this endeavor, but I think prizes make the competition more fun.

I've always loved tinkering with small machines and making them do interesting things.  Laptops and desktops are cool, but there is only so much they can do in the physical world.  We will be giving away [BeagleBone][] kits to the winners along with a slew of fun hardware add-ons to make really cool NodeJS powered robots.

If you enjoy using Cloud9 for developing your awesome wiki, the same environment (albeit a slightly older version) is used in the bundled SDK of the beaglebone.  Node and a full IDE runs from an embedded device that fits into a used altoids can.

Enter for the glory, enter for the fun, enter to challenge yourself and learn more node!

-----------------------

## The Express Route to Building an App

Ok, now let's dig into the actual code that will be the base for your entry.

The wiki is powered by a hip new server-side framework known as [Express][].  This framework, which I helped with by co-authoring the [Connect][] middleware system back in the summer of 2010, makes it very easy write route based HTTP applications.  Express has a view render system built in and some nice helper functions that make life easier for the typical web developer.

The first step for rapid development is to use the `express` command line script.  To install it simple install express globally with [npm][].

    npm install -g express

Once this is done, you will have a executable named `express` in the same path as where your `node` binary was.  Now running `express wiki` generates a basic app structure as follows:

    wiki/
    ├── app.js
    ├── package.json
    ├── public
    │   ├── images
    │   ├── javascripts
    │   └── stylesheets
    │       └── style.css
    ├── routes
    │   └── index.js
    └── views
        ├── index.jade
        └── layout.jade

To run this basic app, simple tell npm to install your dependencies:

    cd wiki
    npm install

And then run the `server.js` file.  You should see a nice welcome to express page when http://localhost:3000/ is opened in a browser.

For more information on using [Express][], see it's webpage or join the express mailing list on google groups.

## Back to the Wiki

I won't walk you through all the steps I used to build this simple express based wiki.  It would make this article long and boring.  But I will quickly show you around the code.

To follow along with a live running app, click on and any of the "Run in Cloud9" links to clone this repo to your personal c9.io environment.  Once cloned, run `npm install` in the console at the bottom to install the needed dependencies.  Then run the `app.js` script.

The first interesting file is the `app.js` main script.  Near the bottom of this script is a place to declare your routes.  I have four simple routes as follows:

    #@git://github.com/nodebits/wiki-challenge.git#app.js,32-35

The root route is where most people will enter the website and simple redirects to the home page of the wiki.  Then there are three routes for doing crud operations on wiki pages.  We want to view, edit, and save these pages.

In this default structure for express, the routes are in a different file at `routes/index.js`.  Let's look at the defined routes one at a time.

First is the route to redirect `/` to `/home`.

    #@git://github.com/nodebits/wiki-challenge.git#routes/index.js,5-7

### Loading Pages

That was easy.  Now how about viewing a page?  Well, first we need to know how to load a page from the database before we can render it to the browser.  In this wiki, the "database" is a folder with markdown files in it.  Since both the "view" and "edit" actions will need to load the same data, this is extracted out into it's own file simply called `db.js`.

This is how a wiki page is loaded from the disk:

    #@git://github.com/nodebits/wiki-challenge.git#db.js,12-51

It's a pretty good chunk of code, so I'm glad it wasn't repeated twice in the two controllers.  In essence it loads the markdown from disk, parses the markdown, extracts the title from the first header and then renders what's left to HTML.  If the file doesn't exist, it generates a placeholder instead of telling the browser there is no such file.

Then back in the controller we use this function to load data and send it out to the view.

    #@git://github.com/nodebits/wiki-challenge.git#routes/index.js,10-15

Since the properties given us in the database are the same properties expected in the view, they cal be passed through unmodified.  How convenient!

Here is the jade template used to render views:

    #@git://github.com/nodebits/wiki-challenge.git#views/view.jade

Editing is much the same.

    #@git://github.com/nodebits/wiki-challenge.git#routes/index.js,18-23

It just uses a different jade template.

    #@git://github.com/nodebits/wiki-challenge.git#views/edit.jade

### Saving Pages

What good is a wiki if you can't edit and create pages.  Did you notice the properties of the form on line 2 of the `edit.jade` template?

    #@git://github.com/nodebits/wiki-challenge.git#views/edit.jade,2

What that means in the browser (I had to look this up to remember) is when the user clicks submit, a POST request will be made to the wiki page's url with an old-school form-encoded body.

Express handles all the details of buffering the body chunks and parsing the form-encoded fields for us since the generated `app.js` file had this line in it.

    #@git://github.com/nodebits/wiki-challenge.git#app.js,17

All that's left is to write a route that handles the POST request, saves the markdown to disk and redirects to the view page.

    #@git://github.com/nodebits/wiki-challenge.git#routes/index.js,26-31

And with that we have a wiki!

Now go forth and make it better.  I'm excited to see what everyone comes up with.

[Cloud9]: http://c9.io/
[BeagleBone]: http://beagleboard.org/bone
[Express]: http://expressjs.org/
[Connect]: http://senchalabs.github.com/connect/
