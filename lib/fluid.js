(function (global, factory) {
  module && module.exports ? module.exports = factory() :
  define && define.amd ? define(factory) : null;
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