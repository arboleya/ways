var name = 'arboleya:ways';

Package.describe({
  name: 'arboleya:ways',
  version: '0.4.0',
  summary: 'Fluid router specially designed for modular UI animations and complex page transitions',
  git: 'https://github.com/arboleya/ways',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('arboleya:happens@0.6.0');
  api.use('arboleya:ways-addressbar@0.2.1');
  api.export('Ways');
  api.addFiles('lib/fluid.js');
  api.addFiles('lib/flow.js');
  api.addFiles('lib/way.js');
  api.addFiles('lib/ways.js');
});

Package.onTest(function (api) {
  api.use(name);
  api.use('tinytest');
  api.use('arboleya:ways');
  api.addFiles('test/meteor.js');
});