var ways = require('../lib/ways'),
    should = require('chai').should();

describe('[match-all]', function() {
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
    ways.flow('destroy+run');
    ways('/', run, destroy);
    ways('*', run, destroy, '/');
  });


  it('should run match-all route', function(done) {
    var requests = [
      {url: '/', pattern: '/', params: {}},
      {url: '/anything', pattern: '*', params: {}}
    ];

    out.log = function(type, req) {
      type.should.equal('run');
      req.should.deep.equal(requests.shift());
      if (requests.length === 0) {
        out.log = null;
        done();
      }
    };

    ways.go('/anything');
  });
});