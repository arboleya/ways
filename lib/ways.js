(function (global, factory) {
  module && module.exports ? module.exports = factory() :
  define && define.amd ? define(factory) : global.Ways = factory();
}(this, function () {

  'use strict';

  // avoid requiring files if CJS or AMD is not supported
  if((module && module.exports) || (define && defined.amd)){
    var Way = require('./way');
    var Flow = require('./flow');
    var Location = require('./location');
  };


  // Config
  var flow = null;
  var mode = null;
  // Ways.location = new Location;
  var location = null;
  var routes = [];


  /**
   * Sets up a new route
   * @param {String} pattern      Pattern string
   * @param {Function} runner     Route's action runner
   * @param {Function} destroyer  Optional, Route's action destroyer (flow mode)
   * @param {String} dependency   Optional, specifies a dependency by pattern
   */
  function Ways(pattern, runner, destroyer, dependency){
    if(flow && arguments.length < 3)
      throw new Error('In `flow` mode you must to pass at least 3 args.');
    
    var route = new Way(pattern, runner, destroyer, dependency);
    routes.push(route);
    return route;
  }

  Ways.init = function() {
    dispatch(Ways.pathname());
  };

  Ways.mode = function (m){
    routes = [];
    if((mode = m) != null)
      flow = new Flow(routes, mode);
  };

  Ways.use = function(location_middleware){
    location = new location_middleware;
    location.on('url:change', function() {
      dispatch(location.pathname());
    });
  };

  Ways.pathname = function(){
    if(location)
      return location.pathname();
  };

  Ways.go = function(url, title, state){
    if(location)
      location.push(url, title, state);
    else
      dispatch(url);
  };

  Ways.go.silent = function(url, title, state){
    if(location)
      location.replace(url, title, state);
  };

  Ways.reset = function(){
    flow = null;
    mode = null;
    routes = [];
  };

  function dispatch(url) {
    var i, url = '/' + url.replace(/^[\/]+|[\/]+$/mg, '');

    for(i in routes)
      if(routes[i].matcher.test(url))
        return run(url, routes[i]);
    
    throw new Error("Route not found for url '"+ url +"'");
  };

  function run(url, route) {
    flow ? flow.run(url, route) : route.run(url);
    return route;
  };

  return Ways;
}));