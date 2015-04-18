var name = 'arboleya:ways';

Package.describe({
  name: 'arboleya:ways',
  version: '0.4.0',
  summary: 'Fluid router specially designed for complex UI animations and page transitions',
  git: 'https://github.com/arboleya/ways',
  documentation: 'README.md'
});
7
Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('arboleya:happens@0.6.0');
  api.use('arboleya:ways-addressbar@0.2.0');
  api.addFiles('lib/ways.js', 'client');
  api.addFiles('lib/way.js', 'client');
  api.addFiles('lib/flow.js', 'client');
  api.addFiles('lib/fluid.js', 'client');
  api.addFiles('meteor.js', 'client');
  api.export('Ways', 'client');
});

Package.onTest(function (api) {
  api.use(name);
  api.use('tinytest');
  api.use('arboleya:ways', 'client');
  api.addFiles('test/meteor.js');
});