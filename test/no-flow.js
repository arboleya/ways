var ways = require('../lib/ways'),
    should = require('chai').should();

describe('[no-flow-mode]', function(){

  var out = null,
      run = null,
      destroy = null;

  before(function(){

    out = {}
    run = function(req) {
      out.log('run', req);
    }

    ways.reset()
    ways('/', run);
    ways('/pages', run);
    ways('/pages/:id', run);
    ways('/pages/:id/edit', run);
    ways('/no/dep', run);
  });

  it('should execute routes in the order they are called', function(done) {

    var requests =  [
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}},
      {url: '/pages', pattern: '/pages', params: {}},
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}},
      {url: '/', pattern: '/', params: {}}
    ];

    out.log = function(type, req) {
      type.should.equal('run');
      req.should.deep.equal(requests.shift());
      if(requests.length === 0) {
        out.log = null;
        done();
      }
    };

    // replace shouldn't do anything
    ways.go.silent('/pages/33/edit');

    ways.go('/pages/33/edit');
    ways.go('/pages');
    ways.go('/pages/33');
    ways.go('/');
  });
});