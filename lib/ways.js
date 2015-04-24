var u = 'undefined', o = 'object';

(function (klass){
  o === typeof exports ? module.exports = klass : 
  u !== typeof Meteor ? Ways = klass : 
  this.Ways = klass;
})(
  _module.apply(null, [
    u !== typeof Happens? Happens : require('happens'),
    u !== typeof WaysWay ? WaysWay : require('./way'),
    u !== typeof WaysFlow ? WaysFlow : require('./flow'),
    u !== typeof Meteor && Meteor.isClient ? WaysAddressBar : 
    u !== typeof Meteor ? null : require('ways-addressbar')
  ])
);


function _module (Happens, Way, Flow, AddresssBar) {
  'use strict';

  // Config
  var flow = null;
  var mode = null;
  var plugin = null;
  var routes = [];

  var current_pathname = null;

  Happens(Ways);

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
    else
      return current_pathname;
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

    current_pathname = null;
  };
  
  Ways.addressbar = AddresssBar || {
    error: 'addressbar plugin can be used only in the client'
  };

  function plugin_url_change(url){
    dispatch(plugin.pathname());
  }

  function dispatch(url) {
    var i, route, url = '/' + url.replace(/^[\/]+|[\/]+$/mg, '');
  
    for(i in routes)
      if((route = routes[i]).matcher.test(url)){
        Ways.emit("url:change", current_pathname = url);
        return (flow ? flow.run(url, route) : route.run(url));
      }

    throw new Error("Route not found for url '"+ url +"'");
  };

  return Ways;
};