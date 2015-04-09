var ways = require('../lib/ways'),
    should = require('chai').should();

describe('[flow-interruption] destroy+run', function() {

  var out = null,
      run = null,
      destroy = null;


  before(function() {
    out = {};
    run = function(req, done) {
      if (out != null) {
        out.log('run', req);
      }
      if (req.url === '/pages') {
        ways.go('/login');
      }
      done();
    };

    destroy = function(req, done) {
      if (out != null) {
        out.log('destroy', req);
      }
      done();
    };
  });


  it('should interrupt current flow and run new (run+destroy)', function(done){
    
    ways.reset();
    ways.flow('destroy+run');
    
    ways('/', run, destroy);
    ways('/pages', run, destroy, '/');
    ways('/pages/:id', run, destroy, '/pages');
    ways('/login', run, destroy);

    var requests = [
      {url: '/', pattern: '/', params: {}},
      {url: '/pages', pattern: '/pages', params: {}},
      {url: '/login', pattern: '/login', params: {}}
    ];

    out.log = function(type, req) {
      type.should.equal('run');
      req.should.deep.equal(requests.shift());

      if (requests.length === 0) {
        out.log = null;
        done();
      }
    };
    ways.go('/pages/33');
  });


  it('should interrupt current flow starts new (destroy+run)', function(done){
    
    ways.reset();
    ways.flow('run+destroy');

    ways('/', run, destroy);
    ways('/pages', run, destroy, '/');
    ways('/pages/:id', run, destroy, '/pages');
    ways('/auth', run, destroy);
    ways('/login', run, destroy, '/auth');
    
    requests = [
      {url: '/', pattern: '/', params: {}},
      {url: '/pages', pattern: '/pages', params: {}},
      {url: '/auth', pattern: '/auth', params: {}},
      {url: '/login', pattern: '/login', params: {}}
    ];

    out.log = function(type, req) {
      type.should.equal('run');
      req.should.deep.equal(requests.shift());
      if (requests.length === 0) {
        out.log = null;
        done();
      }
    };

    ways.go('/pages/33');
  });

});