var ways = require('../lib/ways'),
    should = require('chai').should();

describe('[flow-mode] run+destroy', function() {
  var out = null,
    run = null,
    destroy = null;

  before(function() {
    out = {};
    run = function(req, done) {
      if (out != null) {
        out.log('run', req);
      }
      done();
    };
    destroy = function(req, done) {
      if (out != null) {
        out.log('destroy', req);
      }
      done();
    };

    ways.reset();
    ways.flow('run+destroy');
    ways('/', run, destroy);
    ways('/pages', run, destroy, '/');
    ways('/pages/:id', run, destroy, '/pages');
    ways('/pages/:id/edit', run, destroy, '/pages/:id');
    ways('/no/dep', run, destroy, '/this/does/not/exist');
    
    try {
      ways('/null', function() {});
    } catch (err) {
      var error_msg = "In `flow` mode you must to pass at least 3 args.";
      err.message.should.equal(error_msg);
    }
  });


  it('should run route with param from scratch', function(done) {
    var requests = [
      {url: '/', pattern: '/', params: {} },
      {url: '/pages', pattern: '/pages', params: {}},
      {url: '/pages/33', pattern: '/pages/:id', params: {id: '33'}},
      {url: '/pages/33/edit',pattern: '/pages/:id/edit',params: {id: '33'}}
    ];

    out.log = function(type, req) {
      type.should.equal('run');
      req.should.deep.equal(requests.shift());
      if (requests.length === 0) {
        out.log = null;
        done();
      }
    };
    
    ways.go('/pages/33/edit');
  });


  it('should run pendings and destroy deads', function(done) {
    var request, types = 'run run destroy destroy'.split(' ');

    requests = [
      {url: '/pages/22', pattern: '/pages/:id', params: {id: '22'}},
      {url: '/pages/22/edit', pattern: '/pages/:id/edit', params: {id: '22'}},
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id: '33'}},
      {url: '/pages/33', pattern: '/pages/:id', params: {id: '33'}}
    ];

    out.log = function(type, req) {
      type.should.equal(types.shift());
      req.should.deep.equal(requests.shift());
      if (requests.length === 0) {
        out.log = null;
        done();
      }
    };

    ways.go('/pages/22/edit');
  });


  it('should error on route not found', function() {
    var msg = "Route not found for url '/this/route/does/not/exist'";
    try {
      ways.go('/this/route/does/not/exist');
    } catch (err) {
      err.message.should.equal(msg);
    }
  });


  it('should error on dependency not found', function() {
    var msg = "Dependency '/this/does/not/exist' not found for route '/no/dep'";
    try {
      ways.go('/no/dep');
    } catch (err) {
      err.message.should.equal(msg);
    }
  });
});
