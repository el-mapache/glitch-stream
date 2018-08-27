### Description

Apply processing to frames from a remote video stream, then output the resulting file to the terminal

### Installation

**Heads Up** This has only been tested on a mac, using iTerm.

Before doing anything else, you'll need `homebrew`, `node`, and `npm` installed. You'll
also need a recent version (~4.x) of iTerm.

* `brew install cairo pango ffmpeg`
* npm install

### Usage

_This is still really early so most command line args haven't been hooked up yet!_

Run `node process --source ${url-of-remote-stream}`

Assuming everything works, you should see some output similar to this:

![modified image](./examples/example3.jpg)
