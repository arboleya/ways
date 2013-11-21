Event = require 'the-event'

Route = require './route'
Flow = require './flow'

class Router extends Event

  mode: null
  flow: null
  routes: null
  middlware: null

  constructor:( @mode )->
    @routes = []
    @flow = new Flow @ if @mode?

  use:( Middleware )->
    @middleware = new Middleware

  init:->
    if @middleware?
      @middleware.on 'url:change', => @route @middleware.get_location()
      @route @middleware.get_location()

  get:(pattern, run, destroy, dependency)->
    route = new Route pattern, run, destroy, dependency
    @routes.push route
    return route

  route:( url )->
    url = '/' + url.replace /^[\/]+|[\/]+$/m, ''
    for route in @routes
      if route.matcher.test url
        return @run route, url

    throw new Error "Route not found for url '#{url}'"

  run:( route, url )->
    if @mode?
      @flow.run url, route
    else
      route.run url

    @emit 'url:change', url
    return route

  redirect:( url, title, state, silent )->
    if @middleware?
      if silent
        @middleware.replaceState url, title, state
      else
        @middleware.pushState url, title, state
    else
      @route url


if module?.exports?
  module.exports = Router
else if define?.amd?
  define -> Router
else
  window.TheRouter = Router