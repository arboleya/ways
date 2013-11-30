Event = require 'happens'

Way = require './way'
Flow = require './flow'

class Ways extends Event

  mode: null
  flow: null
  routes: null
  middlware: null

  constructor:( @mode )->
    @routes = []
    if @mode?
      @flow = new Flow @
      @flow.on 'runner:pending', ( url )=> @emit 'url:change'

  use:( Middleware )->
    return if @middleware?
    @middleware = new Middleware
    @middleware.on 'url:change', => @_route @middleware.pathname()


  get:(pattern, runner, destroyer, dependency)->
    route = new Way pattern, runner, destroyer, dependency
    @routes.push route
    return route

  pathname:->
    @middleware?.pathname()



  _route:( url )->
    url = '/' + url.replace /^[\/]+|[\/]+$/m, ''
    for route in @routes
      if route.matcher.test url
        return @_run url, route

    throw new Error "Route not found for url '#{url}'"

  _run:( url, route )->
    if @flow?
      @flow.run url, route
    else
      @emit 'url:change', url
      route.run url

    return route


  push:( url, title, state)->
    if @middleware?
      @middleware.push url, title, state
    else
      @_route url

  replace:( url, title, state, silent )->
    if @middleware?
      @middleware.replace url, title, state

module.exports = Ways