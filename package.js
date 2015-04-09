Package.describe({
  name: 'arboleya:ways',
  version: '1.0.0',
  summary: 'Micro router specially designed for complex UI animations and page transitions',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/serpentem/ways',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});
7
Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('lib/meteor/ways.js', 'client');
  api.addFiles('lib/meteor/way.js', 'client');
  api.addFiles('lib/meteor/flow.js', 'client');
  api.addFiles('lib/meteor/fluid.js', 'client');
  api.export('Ways', 'client');
});