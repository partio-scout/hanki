var _ = require('lodash');
var app = require('../server.js');
var async = require('async');

var fixturesToImport = [
  'User',
  'Account',
  'Titlegroup',
  'Supplier',
  'Delivery',
  'Costcenter',
  'Usageobject',
  'Purchaseorder',
  'Purchaseorderrow',
  'RoleMapping'
];

var closeDBConnectionIfImportComplete = _.after(fixturesToImport.length, function() {
  app.datasources.db.disconnect();
  console.log('Done.');
});

function getTestFixtures(modelName) {
  return require('../../common/fixtures/test-only/' + modelName + '.json');
}

function importFixturesFor(modelName, cb) {
  var fixtures = getTestFixtures(modelName);
  app.models[modelName].create(fixtures, function(err, res) {
    console.log('Create ' + fixtures.length + ' fixtures for ' + modelName + ': ' + (err ? ' FAILED' : 'OK'));
    if (err) {
      console.log(err);
    }
    closeDBConnectionIfImportComplete();
    cb();
  });
}

/*
_.each(fixturesToImport, function(model) {
  importFixturesFor(model);
});
*/

async.eachSeries(fixturesToImport, function(model, cb) {
  importFixturesFor(model, cb);
});
