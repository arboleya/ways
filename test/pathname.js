var ways = require('../lib/ways');
var should = require('chai').should();

describe('[pathname]', function(){

  before(function(){
    var fn = function(){};
    
    ways.reset();
    ways.flow('destroy+run');

    ways('/', fn, fn);
    ways('/a', fn, fn, '/');
    ways('/b', fn, fn, '/a');
  });

  it('pathname should be null at startup', function(done) {
    should.not.exist(ways.pathname());
    done();
  });

  it('pathname should match the current url after startup', function(done) {
    ways.go('/b');
    should.exist(ways.pathname());
    ways.pathname().should.equal('/b');
    done();
  });
});