var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysFlow = klass : 
  this.WaysFlow = klass;
})(
  _module(
    u !== typeof Happens ? Happens : require('happens'),
    u !== typeof WaysFluid ? WaysFluid : require('./fluid')
  )
);


function _module(Happens, Fluid) {

  'use strict';

  function Flow(routes, mode) {
    Happens(this);

    this.routes = routes;
    this.mode = mode;

    this.deads = [];
    this.actives = [];
    this.pendings = [];
    this.status = 'free'
  }

  Flow.prototype.run = function(url, route) {
    var flu, self = this;

    if( this.status == 'busy')
      this.actives.splice(-1, 1);

    this.emit('status:busy');

    this.deads = [];
    this.pendings = [];

    flu = new Fluid(route, url);
    this.filter_pendings(flu);
    this.filter_deads();

    this.status = 'busy';
    if (this.mode === 'run+destroy') {
      this.run_pendings(function() {
        self.destroy_deads(function() {
          self.status = 'free';
          self.emit('status:free', self.mode);
        });
      });
    }
    else if (this.mode === 'destroy+run') {
      this.destroy_deads(function() {
        self.run_pendings(function() {
          self.status = 'free';
          self.emit('status:free', self.mode);
        });
      });
    }
  };

  Flow.prototype.find_dependency = function(parent) {
    var route, flu;

    flu = find(this.actives, function(f) {
      return f.url === parent.dependency;
    });
    if(flu != null) return flu;
    
    route = find(this.routes, function(r) {
      return r.matcher.test(parent.route.dependency);
    });

    if(route != null)
      return new Fluid(route, parent.dependency);

    return null;
  };

  Flow.prototype.filter_pendings = function(parent) {
    var err, flu, route, dep;

    this.pendings.unshift(parent);
    if (parent.dependency == null)
      return;

    if ((flu = this.find_dependency(parent)) != null)
      return this.filter_pendings(flu);

    route = parent.route.pattern;
    dep = parent.dependency
    err = "Dependency '" + dep + "' not found for route '" + route + "'";

    throw new Error(err);
  };

  Flow.prototype.filter_deads = function() {
    var flu, is_pending, i, len;

    for (i = 0, len = this.actives.length; i < len; i++) {
      
      flu = this.actives[i];
      is_pending = find(this.pendings, function(f) {
        return f.url === flu.url;
      });

      if (!is_pending) {
        this.deads.push(flu);
      }
    }
  };

  Flow.prototype.run_pendings = function(done) {
    var flu, is_active, self = this;

    if (this.pendings.length === 0) return done();

    flu = this.pendings.shift();
    is_active = find(this.actives, function(f) {
      return f.url === flu.url;
    });

    if (is_active)
      return this.run_pendings(done);

    this.actives.push(flu);
    this.emit('run:pending', flu.url);

    flu.run(function() {
      self.run_pendings(done);
    });
  };

  Flow.prototype.destroy_deads = function(done) {
    var flu, self = this;

    if (this.deads.length === 0) return done();

    flu = this.deads.pop();
    this.actives = reject(this.actives, function(f) {
      return f.url === flu.url;
    });

    flu.destroy(function() {
      self.destroy_deads(done);
    });
  };

  function find(arr, filter) {
    for (var item, i = 0, len = arr.length; i < len; i++) {
      if (filter(item = arr[i])) {
        return item;
      }
    }
  };

  function reject(arr, filter) {
    for (var item, copy = [], i = 0, len = arr.length; i < len; i++) {
      if (!filter(item = arr[i])) {
        copy.push(item);
      }
    }
    return copy;
  };

  return Flow;
};