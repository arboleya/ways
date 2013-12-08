# Ways

Micro router with [flow-based](#flow-mode) navigation mechanism and adapters support.

[![Build Status](https://travis-ci.org/serpentem/ways.png?branch=master)](https://travis-ci.org/serpentem/ways)
[![Coverage Status](https://coveralls.io/repos/serpentem/ways/badge.png)](https://coveralls.io/r/serpentem/ways)
[![Dependency Status](https://gemnasium.com/serpentem/ways.png)](https://gemnasium.com/serpentem/ways)
[![NPM version](https://badge.fury.io/js/ways.png)](http://badge.fury.io/js/ways)

## Installation

````
npm install ways --save-dev
````

## Adapters

This router alone doesn't implement HTML5 History or Hash support, for browsers.

Instead you may use adapters to expand it.

 * http://github.com/serpentem/ways-browser

````javascript
var ways = require('ways');
var browser = require('ways-browser');

ways.use(browser);
ways('/my/route', function(req){ /* ... */ });
````

## Basics
Basic signature is `ways(pattern, handler)`.

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
````

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
// window.pathname()
ways.go(ways.pathname());
````
 
## Flow mode

Connect your routes altogheter, creating a dependency graph between them.

Lets say you have three routes:

````javascript
ways('/page/', function (req) { /* ... */ });
ways('/page/sidebar', function (req) { /* ... */ });
ways('/page/', function (req) { /* ... */ });
````

Now lets assume that `/c` depends on `/b` that depends on `/a`.

So when we call `/c`, we really want to execute:
  1. First `/a`
  1. Then `/b`
  1. And finally `/c`

That's what flow based mode do.

### Activation

The passed mode tell the order things should run.

```javascript
// ways.mode(mode);
ways.mode('destroy+run'); // destroy first, run after
ways.mode('run+destroy'); // run before, destroy after
````

### Signature changes

In `flow`, the routes can be run or destroyed and signature changes a little.
  
You must pass two handlers instead of one, a `runner` and a `destroyer`.

You may also pass a `dependency`.


````javascript
// ways(pattern, run, destroy, [dependency])

var ways = require('ways');
var pages = require('./pages');

ways('/', pages.base, pages.destroy);

// 'pages/:id' depends on '/'
ways('/pages/:id', pages.show, pages.destroy, '/');

// '/pages/:id/edit' depends on '/pages/:id'
ways('/pages/:id/edit', pages.edit, pages.destroy, '/pages/:id');
````

Both handlers (`run` and `destroy`) will receive two params when called:

- `req` - infos about the request
- `done`- callback to be called when route finishes running or destroying

### Example

Lets take a look at a full example:

````javascript
var ways = require('ways');

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
ways('*', run, destroy);
````

Ok, now lets start our navigation:

#### Step 1

````javascript
ways.go('/pages/33/edit');
````

This will produce the following output:

````
+ RUN url='/', pattern='/', params= Object {}
+ RUN url='/pages', pattern='/pages', params= Object {}
+ RUN url='/pages/33', pattern='/pages/:id', params= Object {id: "33"}
+ RUN url='/pages/33/edit', pattern='/pages/:id/edit', params= Object {id: "33"} 
````
> At the beggining there's no route to be destroyed, so the dependency chain is
> computed and every route gets executed

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
> `destroyed` before running the new ones, this order can be changed passing the
> mode `destroy+run`.

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


### Restricted urls

A simple way to have restricted urls would be like:

````javascript
function auth(){
  // your logic here
  return true;
}
function restrict(next) {
  return function(req, done) {
    auth(function(authorized) {
      if(!authorized)
        ways.go('/login');
      else
        next(req, done);
    });
  }
}

ways('/pages/secret', restrict(pages.secret), pages.destroy)
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

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/serpentem/ways/trend.png)](https://bitdeli.com/free "Bitdeli Badge")