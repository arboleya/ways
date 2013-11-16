Route = require './route'
Flow = require './flow'

module.exports = class Router

  mode: null
  flow: null

  routes: null

  constructor:( @mode )->
    @routes = []
    @flow = new Flow @ if @mode?

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

    return route