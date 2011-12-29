Every once in a while in the progress of a new technology, it's good to take a moment and reflect on good patterns that can be distilled from real world programs.

In this article I will explain a few of the patterns that I've discovered over the years.  They mostly have to deal with control-flow and resource management.

## The "EMFILE, too many open files" Error

When using a non-blocking system like the one in NodeJS, it's very easy to do things that are impossible in blocking systems.  Some of these are bad like running out of file descriptors be you opened the same file 10,000 times in parallel!

For example, using blocking I/O, this is safe:

    #@git://gist.github.com/1535168.git#blockingloop.js,3-5

Each call to `FS.readFileSync` waits for the disk I/O to complete before returning.  This means that you will never have more than one file open at a time.  Not so with non-blocking I/O:

    #@git://gist.github.com/1535168.git#nonblockingloop.js,7-9

If you run this script, you will get the following output:

    /path/to/nonblockingloop.js:5
        if (err) throw err;
                       ^
    Error: EMFILE, too many open files '/path/to/nonblockingloop.js'

The problem here is that since the async version of `FS.readFile` is non-blocking, each call starts a background reading of the file and returns immediately.  The for loop will try to open the same file 10,000 times at once and run out of file descriptors on most systems.

## The Request Batch

One easy fix for this is to not try to open the same file more than once at a time.  A simple batch system can check if the requested resource is already being loaded and piggyback on that existing request instead of making a new concurrent one.

Let's implement a wrapper around `FS.readFile` that implements a request batch:

    #@git://gist.github.com/1535168.git#batch.js,7-32

And then call the wrapper instead in our loop:

    #@git://gist.github.com/1535168.git#batch.js,34-36

This doesn't run out of file descriptors because the request is only actually done once!  This pattern when applied to expensive or resource consuming requests can make your nodeJS application faster and more robust.

## The Request Cache

The batch pattern is fine and dandy for when you're pounding your webserver with `ab` (Apache Bench), but in real life, not everyone visits your site at once.  Often a resource will be requested that you just finished serving a short time ago.  In this case a cache can save time and resources.

The most simple cache simply stores the result in memory forever and short-cuts the request if the same request is made again.

    #@git://gist.github.com/1535168.git#cache.js,7-27

Since we want to test sequential requests and not concurrent requests, we will call the function 10,000 times in chained callbacks.

    #@git://gist.github.com/1535168.git#cache.js,30-36

Now we can make 10,000 requests serially and it's only actually loaded once.  If you've done this before, you're probably worried about two things right now.

 1. This function is vunerable to concurrent requests again.
 2. What about cache invalidation!

Ok, so point one is easy.  Just combine the batching and caching strategy into the same function.  They perform different tasks and protect against different usage patterns.

    #@git://gist.github.com/1535168.git#cachebatch.js,7-28

And to test this combined wrapper, we'll combine the tests and request it 10,000 times concurrently 10,000 times serially (yes that's 10,000×10,000 requests)!

    #@git://gist.github.com/1535168.git#cachebatch.js,31-39

Cache invalidation is a bit harder, but a simple solution is to just expire the cache after a short while.  This can be done with a simple `setTimeout` when setting the cache value.

    #@git://gist.github.com/1535168.git#cachetimer.js

## The Done Flag

## Shared Error Router

## Function Composition

## Parallel Groups

## Named Callbacks

