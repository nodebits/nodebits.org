Every once in a while in the progress of a new technology, it's good to take a moment and reflect on good patterns that can be distilled from real world programs.

In this article I will explain a few of the patterns that I've discovered over the years.  They mostly have to deal with control-flow and resource management.

## The Request Batch

When using a non-blocking system like the one in NodeJS, it's very easy to do things that are impossible in blocking systems.  Some of these are bad like running out of file descriptors be you opened the same file 1,000 times in parallel!

For example, using blocking I/O, this is safe:

    #@git://gist.github.com/1535168.git#blockingloop.js,3-5

Each call to `FS.readFileSync` waits for the disk I/O to complete before returning.  This means that you will never have more than one file open at a time.  Not so with non-blocking I/O:

    #@git://gist.github.com/1535168.git#nonblockingloop.js,3-7

So we should batch things

    #@git://gist.github.com/1535168.git#batch.js

## The Request Cache

    #@git://gist.github.com/1535168.git#cache.js

cache with batch

    #@git://gist.github.com/1535168.git#cachebatch.js

cache with timer

    #@git://gist.github.com/1535168.git#cachetimer.js

## The Done Flag

## Shared Error Router

## Function Composition

## Parallel Groups

## Named Callbacks

