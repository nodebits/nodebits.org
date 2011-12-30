Every once in a while in the progress of a new technology, it's good to take a moment and reflect on good patterns that can be distilled from real world programs.

In this article I will explain a few of the patterns that I've discovered over the years.  They mostly have to deal with control-flow and resource management.

## The "EMFILE, too many open files" Error

NodeJS uses a very powerful I/O model where all operations are non-blocking.  This makes many new things possible such as reading two files in parallel.  It also creates many new pitfalls.  For example, it's possible to run out of file descriptors because you opened the same file 10,000 times in parallel!

For example, using blocking I/O, this is safe:

    #@git://github.com/nodebits/distilled-patterns.git#blockingloop.js,3-5

Each call to `FS.readFileSync` waits for the disk I/O to complete before returning.  This means that you will never have more than one file open at a time.  Not so with non-blocking I/O:

    #@git://github.com/nodebits/distilled-patterns.git#nonblockingloop.js,7-9

If you run this script, you will get the following output:

    /path/to/nonblockingloop.js:5
        if (err) throw err;
                       ^
    Error: EMFILE, too many open files '/path/to/nonblockingloop.js'

The problem here is that since the async version of `FS.readFile` is non-blocking, each call starts a background reading of the file and returns immediately.  The for loop will try to open the same file 10,000 times at once and run out of file descriptors on most systems.

## The Request Batch

One easy fix for this is to not try to open the same file more than once at a time.  A simple batch system can check if the requested resource is already being loaded and piggyback on that existing request instead of making a new concurrent one.

Let's write a wrapper around `FS.readFile` that implements a request batch:

    #@git://github.com/nodebits/distilled-patterns.git#batch.js,4-23

And then call the wrapper instead in our loop:

    #@git://github.com/nodebits/distilled-patterns.git#batch.js,26-28

This doesn't run out of file descriptors because the request is only actually done once!  This pattern, when applied to expensive or resource consuming requests, can make your nodeJS application faster and more robust.

## The Request Cache

The batch pattern is fine and dandy for when you're pounding your web-server with `ab` (Apache Bench), but in real life, not everyone visits your site at once.  Often a resource will be requested that you just finished serving a short time ago.  In this case a cache can save time and resources.

The most simple cache simply stores the result in memory forever and short-cuts the request if the same request is made again.

    #@git://github.com/nodebits/distilled-patterns.git#cache.js,4-24

Since we want to test sequential requests and not concurrent requests, we will call the function 10,000 times in chained callbacks.

    #@git://github.com/nodebits/distilled-patterns.git#cache.js,27-31

Now we can make 10,000 requests serially and it's only actually loaded once.  If you've done this before, you're probably worried about two things right now.

 1. This function is vulnerable to concurrent requests again.
 2. What about cache invalidation!

Ok, so point one is easy.  Just combine the batching and caching strategy into the same function.  They perform different tasks and protect against different usage patterns.

    #@git://github.com/nodebits/distilled-patterns.git#cachebatch.js,4-34

And to test this combined wrapper, we'll combine the tests and request it 10,000 times, but using 100 concurrent chains.

    #@git://github.com/nodebits/distilled-patterns.git#cachebatch.js,37-43

Cache invalidation is a bit harder, but a simple solution is to just expire the cache after a short while.  This can be done with a simple `setTimeout` when setting the cache value.

    #@git://github.com/nodebits/distilled-patterns.git#cachetimer.js,21-29

Usually you'll want to expose this variable so that external software can control the cache lifetime or turn it off completely.

## The General Wrapper

As software developers, we don't like to repeat ourselves.  We want to do something once, package it in a library and never do it again.

![The General Problem](http://imgs.xkcd.com/comics/the_general_problem.png "I find that when someone's taking time to do something right in the present, they're a perfectionist with no ability to prioritize, whereas when someone took time to do something right in the past, they're a master artisan of great foresight.")

This is good sometimes, but it can be overdone too.  In this simple wrapper, we assume the the function to be wrapped has two arguments.  The first is a unique key and the second is a callback.  We also assume the callback will have error and value as its two arguments.

It's a fairly specific requirement for this "general" wrapper, but many requests can be wrapped to fit into this pattern if needed.

    #@git://github.com/nodebits/distilled-patterns.git#wrap.js

We can use this wrapper as a module:

    #@git://github.com/nodebits/distilled-patterns.git#testwrap.js

## In the Next Edition

There are so many more patterns I've discovered, but it would make for a very long and hard to remember blog post, so I'll save them for future articles.  This site has a tagging system and you can easily find the whole series by searching for the `best-practices` tag in the right column.

If you have some great patterns that you're discovered that can be distilled into simple ideas, please share them in the comments.
