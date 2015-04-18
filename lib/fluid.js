(function (global, factory) {
  "object" === typeof exports ? module.exports = factory() :
  "function" === typeof define && define.amd ? define(factory) :
  global.Fluid = factory();
}(this, function () {

  'use strict';

  function Fluid(route, url) {
    this.route = route;
    this.url = url;

    if(route.dependency)
      this.dependency = route.computed_dependency(url);
  }

  Fluid.prototype.run = function(done) {
    this.req = this.route.run(this.url, done);
  };

  Fluid.prototype.destroy = function(done){
    if(this.req) this.route.destroy(this.req, done);
  };

  return Fluid;
}));