var ways = require('../lib/ways');
var should = require('chai').should();

describe('[events]', function(){

  before(function(){
    ways.reset();
    ways('/pages', function(){});
  });

  var url_changed;
  function url_change(url){
    url_changed = url;
  }

  it('should dispatch an event when the url changes', function(done) {
    ways.on('url:change', url_change);
    ways.go('/pages');
    url_changed.should.equal('/pages');
    done();
  });

  it('should not dispatch event after listener is removed', function(done) {
    url_changed = 'none';
    ways.off('url:change', url_change);
    ways.go('/pages');
    url_changed.should.equal('none');
    done();
  });
});
