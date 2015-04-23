var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysFluid = klass : 
  this.WaysFluid = klass;
})(_module());

function _module () {

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
};