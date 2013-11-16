# The Router

Router for [Theoricus](https://github.com/theoricus/theoricus) framework.

[![Stories in Ready](https://badge.waffle.io/theoricus/the-router.png)](http://waffle.io/theoricus/the-router)  

[![Build Status](https://travis-ci.org/theoricus/the-router.png?branch=master)](https://travis-ci.org/theoricus/the-router) [![Coverage Status](https://coveralls.io/repos/theoricus/the-router/badge.png)](https://coveralls.io/r/theoricus/the-router) [![Dependency Status](https://gemnasium.com/theoricus/the-router.png)](https://gemnasium.com/theoricus/the-router)

## Usage Drafts

Simple draft demonstrating how this should work.

> Attention, is a **WIP**! Do not use it yet.

### Main concept

The router is build to work in two modes:
 1. Default - has no tricks
 1. Flow - introduces a flow-based navigation mechanism with interconected
 routes

### Routes & Arguments

Simple route:

````coffeescript
router.get '/pages', listener
````

Route with named params:

````coffeescript
router.get '/pages/:id', listener
````

Route with splat params:

````coffeescript
router.get '/pages/:id/tags/*tags', listener
````

Match-all:

````coffeescript
router.get '*', listener
````

Optional params:

````coffeescript
router.get '/pages/:id?', listener
router.get '/pages/:id?/tags/*tags?', listener
````


### Default mode

This mode is pretty straightforward, no tricks, just simple routing.

````coffeescript
router = new Router

router.get '/', (req)->
  console.log 'url =', req.url
  console.log 'pattern =', req.pattern

router.get '/pages/:id', (req)->
  console.log 'url =', req.url
  console.log 'pattern =', req.pattern
  console.log 'params =', req.params

router.route '/'
# Will output:
#   url = /
#   pattern = /

router.route '/pages/33'
# Will output:
#   url = /pages/33
#   pattern = /pages/:id
#   params = Object { id: 33 }
````

````coffeescript
router.get '/pages/:id/tags/*tags?'
````

### Flow mode

Specially built for single page applications with *complex presentation layer*
in mind, in `flow` mode you can connect your routes altogheter, creating a
dependency graph between them.

Lets say you have three routes:

````coffeescript
router.get '/a', (req)->
router.get '/b', (req)->
router.get '/c', (req)->
````

Now lets assume that `/c` depends on `/b` that depends on `/a`.

So when we call `/c`, we really want to execute:
  1. First `/a`
  1. Then `/b`rn], [runner], [des
  1. And finally `/c`

#### Signature changes

In `flow` mode the `constructor` should receive a transitional mode, tha can be
`destroy+render` or `render+destroy`. This will tell the order that things
should run.

The `.get` method accepts more arguments as well, lets take a look at both.



````coffeescript
# router = new Router [flow-mode]
# router = new Router 'render+destroy'
router = new Router 'destroy+render'

# router.get [pattetroyer], [dependency]
router.get '/', Pages.base, Pages.destroy
router.get '/pages/:id', Pages.show, Pages.destroy, '/'
router.get '/pages/:id/edit', Pages.edit, Pages.destroy, '/pages/:id'
````

Note that now we've passed two listeners among the `.get` call (`runner` and
`destroyer`).

Both will receive two params when called:
- `req` - infos about the request
- `done`- callback to be called when route finishes running or destroying

#### Example

Lets take a look at a full example:

````coffeescript
Router = require '../../the-router/src/router'

render = (req, done)->
  console.log "+ RENDER url='#{req.url}', " +
              "pattern='#{req.pattern}', " +
              'params=', req.params
  done()

destroy = (req, done)->
  console.log "- DESTROY url='#{req.url}', " +
              "pattern='#{req.pattern}', " +
              'params=', req.params
  done()

router = new Router 'destroy+render'

router.get '/', render, destroy
router.get '/pages', render, destroy, '/'
router.get '/pages/:id', render, destroy, '/pages'
router.get '/pages/:id/edit', render, destroy, '/pages/:id'
router.get '*', render, destroy
````

Ok, now lets start our navigation:

##### Step 1

````coffeescript
router.route '/pages/33/edit'
````

This will produce the following output:

````
+ RENDER url='/', pattern='/', params= Object {}
+ RENDER url='/pages', pattern='/pages', params= Object {}
+ RENDER url='/pages/33', pattern='/pages/:id', params= Object {id: "33"}
+ RENDER url='/pages/33/edit', pattern='/pages/:id/edit', params= Object {id: "33"} 
````
> At the beggining there's no route to be destroyed, so the dependency chain is
> computed and every route gets executed

##### Step 2

````coffeescript
router.route '/pages/22/edit'
````

This will produce the following output:

````
- DESTROY url='/pages/33/edit', pattern='/pages/:id/edit', params= Object {id: "33"}
- DESTROY url='/pages/33', pattern='/pages/:id', params= Object {id: "33"}
+ RENDER url='/pages/22', pattern='/pages/:id', params= Object {id: "22"}
+ RENDER url='/pages/22/edit', pattern='/pages/:id/edit', params= Object {id: "22"}
````

> Here we have two routes being destroyed before running the new ones, this is computed
> again based on the dependency chain. In this case, uesless routes are `destroyed` before
> running the new ones, this order can be changed passing the mode `destroy+render` to the
> router constructor.

##### Step 3

````coffeescript
router.route '/any/route/here'
````

This will produce the following output:

````
- DESTROY url='/pages/22/edit', pattern='/pages/:id/edit', params= Object {id: "22"} flow.coffee:10
- DESTROY url='/pages/22', pattern='/pages/:id', params= Object {id: "22"} flow.coffee:10
- DESTROY url='/pages', pattern='/pages', params= Object {} flow.coffee:10
- DESTROY url='/', pattern='/', params= Object {} flow.coffee:10
+ RENDER url='/any/thing/here', pattern='*', params= Object {} 
````

> As the route in question here has no dependencies, note that every other route needs to
> be destroyed before it runs.


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