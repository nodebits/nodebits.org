Everyone knows that NodeJS can be used to make  über fast webservers. But did
you know that it's good for low level tasks too?  In this article we'll write a
joystick driver for Linux. Technically it's not that low level, the kernel is
handling the hard bits for us, but the results are still very cool.

![f310](/linux-joystick/f310.png)

Those who have seen my past experiments with [SDL][] and [OpenGL][] in NodeJS know that I
love to give demos where I hook up a USB gamepad to a NodeJS server and do
something cool with it. The problem was that I needed C++ bindings to libSDL to
be able to talk to the gamepad.

It turns out I was wrong and (on Linux systems at least) it's trivial to read
directly from the system device file and parse the protocol.

## On Reading the Device

One nice thing about Unix systems is that *everything* is a file. Folders are
files. Processes are represented as files. And USB gamepads are represented as
files! So to test this theory, I ran `cat` on `/dev/input/js0` which is the
representation of my first joystick. I then moved the joystick around and stuff
got emitted.

![/dev/input/js0](/linux-joystick/js0.png)

Hot dog, we're in business!  Now if only there was a document that explained
what all that binary nonesense meant.

--------------------------------------------------------------------------------

## Parsing the Output

After some brief searching online, I discovered that this is the Linux input
joystick api documented at <http://www.kernel.org/doc/Documentation/input/joystick-api.txt>.

In particular, the section about the format of the binary stuff that was getting
emitted by the file when I moved the joystick says that I need to:

    struct js_event e;
    read (fd, &e, sizeof(struct js_event));

where js_event is defined as

    struct js_event {
      __u32 time;     /* event timestamp in milliseconds */
      __s16 value;    /* value */
      __u8 type;      /* event type */
      __u8 number;    /* axis/button number */
    };

Clearly this is meant for C programmers, but using this information from a
NodeJS program isn't hard. We have to calculate the `sizeof(struct js_event)` by
hand. It's 8 bytes. And we don't want to use a blocking read, but luckilly a
non-blocking read works fine too.

Let's write a small program that constantly reads 8 byte chunks from the file.

    #@git://github.com/nodebits/linux-joystick.git#read-loop.js,3-15

Running that and moving the joystick around gives me somewhat structured data:

    event <Buffer 10 60 f8 1a c3 f6 02 00>
    event <Buffer 48 60 f8 1a 00 00 02 00>
    event <Buffer 10 62 f8 1a 01 00 01 01>
    event <Buffer 40 62 f8 1a 01 00 01 00>

I know from the kernel documentation that the first four bytes are a timestamp.
I can see from the output that it's little endian (the first byte changes very
fast, the last doesn't change at all). From the NodeJS docs, I see that we need
[Buffer.readUInt32LE][].

The next two bytes are the value as a signed 16 bit integer. For this we need
[Buffer.readInt16LE][]. I assume the same endianess for everything else. It's
rarely mixed within a single struct.

Then the last two values are regular unsigned 8 bit integers. I can use
[Buffer.readUInt8][] or just use the normal `[]` access that buffers always
provided.

Updating the example, we add the following parse function:

    #@git://github.com/nodebits/linux-joystick.git#read-loop2.js,3-10

Which outputs lines like:

    { time: 453074028, value: -9797, type: 2, number: 0 }

## Making it Developer Friendly

Ok, so we've gone from raw binary blobs to some nice integers in a json object.
But we can do better. For example, the value is a 16 bit signed integer. A
float from -1 to 1 might be nice, might not. Also, what does type 2 mean anyway?
Going back to the kernel docs, we read that the possible values of `type` are:

    #define JS_EVENT_BUTTON         0x01    /* button pressed/released */
    #define JS_EVENT_AXIS           0x02    /* joystick moved */
    #define JS_EVENT_INIT           0x80    /* initial state of device */

> As mentioned above, the driver will issue synthetic `JS_EVENT_INIT` ORed
> events on open. That is, if it's issuing a `INIT BUTTON` event, the
> current type value will be

    int type = JS_EVENT_BUTTON | JS_EVENT_INIT;  /* 0x81 */

So to make things easier on the user, we can parse out this information as well
and set the string `button` or `axis` for type. Also we'll add a `init`
property if that bit is set.

With these changes the new parse function looks like:

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,4-15

## Objectifying the Code

The other problem with out code is it's a nested mess and makes some inflexible
assumptions like which joystick to open and throws on all errors. We can create
a Joystick constructor class that is reusable.

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,18-27

This constructor inherits from `EventEmitter` and is thus an emitter itself. I
wanted errors to be routed to an `error` event instead of littering all my
callbacks. The wrap function seen here is a small utility to both bind the
method to this instance and route the error parameter to the `error` event.

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,30-37

With this framework in place, implementing `onOpen` is very straightforward:

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,39-42

Once the file is open and we have a valid file descriptor, all that's left is
the recursive read loop. It's implemented as:

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,44-53

Remember that the `onRead` and `onOpen` prototype functions are wrapped and
bound to the instance. That's why I'm able to use them directly in place of the
callback. This is an example of how smart use of the language can make async
callbacks beautiful.

All that's left is to provide a way to eventually close this resource. So we'll
add a simple close function.

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,55-58

## Using the API

Now that we have this nice shiny API, how is it used? Quite simply in fact:

    #@git://github.com/nodebits/linux-joystick.git#joystick.js,63-65

When run on my local machine, I get the following output:

    $ node joystick.js
    { time: 454750604,
      value: 0,
      number: 0,
      init: true,
      type: 'button',
      id: 0 }
    { time: 454750608,
      value: 0,
      number: 1,
      init: true,
      type: 'button',
      id: 0 }
    { time: 454750612,
      value: 0,
      number: 0,
      init: true,
      type: 'axis',
      id: 0 }
    { time: 454750612,
      value: 0,
      number: 1,
      init: true,
      type: 'axis',
      id: 0 }
    { time: 454752448, value: 337, number: 0, type: 'axis', id: 0 }
    { time: 454752456, value: 1689, number: 0, type: 'axis', id: 0 }
    { time: 454752464, value: 2364, number: 0, type: 'axis', id: 0 }
    { time: 454752480, value: 3715, number: 0, type: 'axis', id: 0 }
    { time: 454752488, value: 4391, number: 0, type: 'axis', id: 0 }
    { time: 454752496, value: 5067, number: 0, type: 'axis', id: 0 }
    ...

## Going on From Here

There are many places you can go on from here. I will note that this code
probably won't run on your web server unless you happen to have an USB gamepad
or joystick plugged into it. It will however run on your Linux desktop or
laptop. Often the accelerometer in a laptop is exposed as a joystick in Linux.

In addition this isn't limited to joysticks, any special device on your system
is open to being read from NodeJS. No special binary add-ons are required. Just
read up on the documentation of the protocol and implement it in javascript. One
of my first NodeJS projects was implementing the PostgreSQL wire protocol in
pure JS. I was able to query my database without using any C++.

The world is wide open with possibilities. Don't feel limited by your lack of
ability or desire to program in C++. A great many things can be done in pure
JavaScript. NodeJS provides an amazing amount of system primitives used to write
many types of software.

Happy coding!

[SDL]: https://github.com/creationix/node-sdl
[OpenGL]: https://github.com/creationix/webgl-sdl
[Buffer.readUInt32LE]: http://nodemanual.org/latest/nodejs_ref_guide/buffer.html#Buffer.readUInt32LE
[Buffer.readInt16LE]: http://nodemanual.org/latest/nodejs_ref_guide/buffer.html#Buffer.readInt16LE
[Buffer.readUInt8]: http://nodemanual.org/latest/nodejs_ref_guide/buffer.html#Buffer.readUInt8

