[![Build Status](https://travis-ci.org/arboleya/ways.svg)](https://travis-ci.org/arboleya/ways)
[![Coverage Status](https://coveralls.io/repos/arboleya/ways/badge.svg?branch=master)](https://coveralls.io/r/arboleya/ways?branch=master)
[![Code Climate](https://codeclimate.com/repos/553a5f77e30ba071310005d5/badges/b23591a0ab4283258afd/gpa.svg)](https://codeclimate.com/repos/553a5f77e30ba071310005d5/feed)
[![Dependency Status](https://gemnasium.com/arboleya/ways.svg)](https://gemnasium.com/arboleya/ways)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ways-addressbar.svg?auth=fbb31316b6b3b70a62d6697c4ce14da3)](https://saucelabs.com/u/ways)

# Ways

Fluid router specially designed for [complex page transitions](#flow-mode)
and [granular UI animations](#flow-mode).

But not only that.


  - [Installation](#installation)
  - [Basics](#basics)
    - [AddressBar](#addressbar)
    - [Go](#go)
    - [Go Silent](#go-silent)
    - [Pathname](#pathname)
  - [Flow mode](#flow-mode)
    - [Activation](#activation)
    - [Signature changes](#signature-changes)
    - [Example](#example)
      - [Step 1](#step-1)
      - [Step 2](#step-2)
      - [Step 3](#step-3)
  - [Events](#events)
  - [Restricted urls](#restricted-urls)


## Installation

````shell
# node
npm install ways # --save, --save-dev

# bower
bower install ways # --save, --save-dev

# meteor
meteor add arboleya:ways # <- Ways is exported with a **capital** W!
````

## Basics

Basic signature is `ways(pattern, handler)`.

> In **Meteor**, consider `Ways` is exported with a capital `W`.

````javascript
var ways = require('ways');

// simple route
ways('/pages', function(req){
  // req.pattern, req.url, req.params
});

// named params
ways('/pages/:id', handler);

// splat params
ways('/pages/:id/tags/*tags', handler);

// optional params
ways('/pages/:id?', handler);
ways('/pages/:id?/tags/*tags?', handler);

// match-all
ways('*', handler);

// initialize with current url
ways.go(ways.pathname());
````

### AddressBar

By default `Ways` doesn't offers support for `/pushState` and `#hash`, there's
no browser dependency whatsoever. Therefore you can use it  wherever you want
to, even on the server. Or keep in the client, but without affecting urls.

However, sometimes you'll want to activate addressbar support, like this:

````javascript
// activate addressbar support
ways.use(ways.addressbar);
````

And you're done.


### Go

Redirects app.
```javascript
// ways.go(url, [title, [state]]);
ways.go('/pages');
ways.go('/pages', 'Page Title');
ways.go('/pages', 'Page Title', {foo: 'bar'});
````

### Go Silent
Same as `ways.go`, but in silent mode, without triggering any route.

```javascript
// ways.go.silent(url, [title, [state]]);
ways.go.silent('/pages');
ways.go.silent('/pages', 'Page Title');
ways.go.silent('/pages', 'Page Title', {foo: 'bar'});
````
> Think about `go() = pushState`, `go.silent() = replaceState`

### Pathname

Gets current pathname.

```javascript
// ways.pathname();
ways.go(ways.pathname());
````
 
## Flow mode

Connect your routes altogheter, creating a dependency graph between them.

Lets say you have three routes:

````javascript
ways('/a', function (req) { /* ... */ });
ways('/b', function (req) { /* ... */ });
ways('/c', function (req) { /* ... */ });
````

Now lets assume that `/c` depends on `/b` that depends on `/a`.

So when we call `/c`, we really want to execute:

  1. First `/a`
  1. Then `/b`
  1. And finally `/c`

That's what flow based mode would do for you.

And more:

 * Routes' execution occurs asynchronously and sequentially
 * Dependency chain is computed automatically, no more routes' hell
 * Pack your projects with granular UI animations and complex page transitions
 * Forget the `Layout <- View` paradigm, embrace the `View <-> View` reality

> TODO: Maybe explain wtf is `View <-> View`


### Activation

The passed mode tell the order things should run.

```javascript
// ways.flow(mode);
ways.flow('destroy+run'); // destroy first, run after
ways.flow('run+destroy'); // run before, destroy after
````

Don't panic, continue reading.

### Signature changes

In `flow` mode, the routes can be run or destroyed and signature changes a
little. You must pass two handlers instead of one: a `runner` and a `destroyer`.

Optionally, you may also (*most probably*) pass a `dependency`.


````javascript
// ways(pattern, run, destroy, [dependency])

var ways = require('ways');

ways.flow('destroy+run');

function run(req, done){
  console.log('rendering', req);
  done();
}

function destroy(req, done){
  console.log('destroying', req);
  done();
}

ways('/', run, destroy);
ways('/pages/:id', run, destroy, '/'); // [1]
ways('/pages/:id/edit', run, destroy, '/pages/:id'); // [2]

// [1] 'pages/:id' depends on '/'
// [2] '/pages/:id/edit' depends on '/pages/:id'
````

Both handlers (`run` and `destroy`) will receive two params when called:

- `req` - infos about the request
- `done`- callback to be called when route finishes running or destroying

### Example

Lets take a look at a full example:

````javascript
var ways = require('ways');

ways.flow('destroy+run');

var running = '+ RUN url=%s, pattern=%s, params='
var destroying = '- DESTROY url=%s, pattern=%s, params='

var run = function(req, done) {
  console.log(running, req.url, req.pattern, req.params);
  done();
};

var destroy = function(req, done) {
  console.log(destroying, req.url, req.pattern, req.params);
  done();
};

ways('/', run, destroy);
ways('/pages', run, destroy, '/');
ways('/pages/:id', run, destroy, '/pages');
ways('/pages/:id/edit', run, destroy, '/pages/:id');
ways('*', run, destroy); // <- this is a catch all
````

Ok, now lets start our navigation:

#### Step 1

````javascript
// pretend our firt and current url is '/pages/33/edit',
// we'll use `ways.pathname()` to get it

ways.go(ways.pathname());
````

This will produce the following output:

````
+ RUN url='/', pattern='/', params= Object {}
+ RUN url='/pages', pattern='/pages', params= Object {}
+ RUN url='/pages/33', pattern='/pages/:id', params= Object {id: "33"}
+ RUN url='/pages/33/edit', pattern='/pages/:id/edit', params= Object {id: "33"} 
````
> At the beggining there's no route to be destroyed, so the dependency chain is
> computed and every route gets executed, one after another, asynchronously.

#### Step 2

````javascript
ways.go('/pages/22/edit');
````

This will produce the following output:

````
- DESTROY url='/pages/33/edit', pattern='/pages/:id/edit', params= Object {id: "33"}
- DESTROY url='/pages/33', pattern='/pages/:id', params= Object {id: "33"}
+ RUN url='/pages/22', pattern='/pages/:id', params= Object {id: "22"}
+ RUN url='/pages/22/edit', pattern='/pages/:id/edit', params= Object {id: "22"}
````

> Here we have two routes being destroyed before running the new ones, this is
> computed again based on the dependency chain. In this case, useless routes are
> `destroyed` before running the new ones, the opposite is achieved by passing
> the mode `run+destroy`.

#### Step 3

````javascript
ways.go('/any/route/here');
````

This will produce the following output:

````
- DESTROY url='/pages/22/edit', pattern='/pages/:id/edit', params= Object {id: "22"}
- DESTROY url='/pages/22', pattern='/pages/:id', params= Object {id: "22"}
- DESTROY url='/pages', pattern='/pages', params= Object {}
- DESTROY url='/', pattern='/', params= Object {}
+ RUN url='/any/thing/here', pattern='*', params= Object {} 
````

> As the route in question here has no dependencies, note that every other route
> needs to be destroyed before it runs.


## Events

There's only one global event you can listen to.

````javascript
ways.on('url:change', function(url){
  console.log('current url is', url);
});
````

## Restricted urls

A simple way to have restricted urls would be like:

````javascript
function auth(done){
  // your logic here
  done(true);
}

function restrict(action) {
  return function(req, done) {
    auth(function(authorized) {
      if(!authorized)
        ways.go('/login');
      else
        action(req, done);
    });
  }
}

ways('/pages/secret', restrict(run), destroy)
````

# License

The MIT License (MIT)

Copyright (c) 2013 Anderson Arboleya

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.