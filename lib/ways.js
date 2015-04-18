(function (global, factory) {
  module && module.exports ? module.exports = factory() :
  define && define.amd ? define(factory) : global.Ways = factory();
}(this, function () {

  'use strict';

  // avoid requiring files if CJS or AMD is not supported
  if((module && module.exports) || (define && defined.amd)){
    var Way = require('./way');
    var Flow = require('./flow');
    var WaysAddressBar = require('ways-addressbar');
  };

  // Config
  var flow = null;
  var mode = null;
  var plugin = null;
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

  Ways.flow = function (m){
    routes = [];
    if((mode = m) != null)
      flow = new Flow(routes, mode);
  };

  Ways.use = function(plug){
    plugin = new plug;
    plugin.on('url:change', plugin_url_change);
  };

  Ways.pathname = function(){
    if(plugin)
      return plugin.pathname();
  };

  Ways.go = function(url, title, state){
    if(plugin)
      plugin.push(url, title, state);
    else
      dispatch(url);
  };

  Ways.go.silent = function(url, title, state){
    if(plugin)
      plugin.replace(url, title, state);
  };

  Ways.reset = function(){
    if(plugin)
      plugin.off('url:change', plugin_url_change)

    flow = null;
    mode = null;
    plugin = null;
    routes = [];
  };

  function plugin_url_change(url){
    dispatch(plugin.pathname());
  }

  function dispatch(url) {
    var i, route, url = '/' + url.replace(/^[\/]+|[\/]+$/mg, '');

    for(i in routes)
      if((route = routes[i]).matcher.test(url))
        return (flow ? flow.run(url, route) : route.run(url));

    throw new Error("Route not found for url '"+ url +"'");
  };

  Ways.addressbar = WaysAddressBar;

  return Ways;
}));