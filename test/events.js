var ways = require('../lib/ways'),
    should = require('chai').should();

describe('[events]', function(){

  var out = null,
      run = null,
      destroy = null;

  before(function(){

    run = function(req) {

    }

    ways.reset()
    ways('/', run);
    ways('/pages', run);
  });

  it('should dispatch an event when the url changes', function(done) {

    ways.on("url:change", function (pathname) {
      pathname.should.equal('/pages')
      done()
    });

    ways.go('/pages');
  });

  it('should remove event when the url changes', function(done) {

    ways.off("url:change");
    done()
    ways.go('/pages');
  });
});
