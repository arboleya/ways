var ways = require('../lib/ways'),
    happens = require('happens'),
    should = require('chai').should();

function Adapter() {
  happens(this);
}

Adapter.prototype.url = null;
Adapter.prototype.state = null;
Adapter.prototype.title = null;

Adapter.prototype.pathname = function() {
  return this.url;
};

Adapter.prototype.push = function(url, title, state) {
  this.url = url;
  this.title = title;
  this.state = state;
  this.emit('url:change');
};

Adapter.prototype.replace = function(url, title, state) {
  this.url = url;
  this.title = title;
  this.state = state;
};


describe('[adapters]', function() {
  it('should make proper use of adapters', function(done) {
    
    var requests = [
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id: '33'}},
      {url: '/pages', pattern: '/pages', params: {}},
      {url: '/pages/33', pattern: '/pages/:id', params: {id: '33'}},
      {url: '/', pattern: '/', params: {}}
    ];

    var out = {
      log: function(type, req) {
        type.should.equal('run');
        req.should.deep.equal(requests.shift());
        if (requests.length === 0) {
          out.log = null;
          done();
        }
      }
    };

    var run = function(req) {
      out.log('run', req);
    };

    ways.reset();
    ways.use(Adapter);
    
    ways('/', run);
    ways('/pages', run);
    ways('/pages/:id', run);
    ways('/pages/:id/edit', run);
    ways('/no/dep', run);
    
    ways.go.silent('/pages/33/edit'); // <- shouldn't do anything!
    ways.go('/pages/33/edit');

    should.exist(ways.pathname());
    ways.pathname().should.equal('/pages/33/edit');

    ways.go('/pages');
    ways.go('/pages/33');

    ways.go('/');
  });

});