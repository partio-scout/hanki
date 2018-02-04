var _ = require('lodash');
var app = require('../server');
var Promise = require('bluebird');

var fixturesToImport = [
  'Purchaseuser',
  'Account',
  //'Titlegroup',
  'Title',
  'Supplier',
  'Purchaseorder',
  'Purchaseorderrow',
  'RoleMapping',
  'History',
];

var closeDBConnectionIfImportComplete = _.after(fixturesToImport.length, function() {
  app.datasources.db.disconnect();
  console.log('Done.');
});

function getTestFixtures(modelName) {
  return require('../../common/fixtures/test-only/' + modelName + '.json');
}

function importFixturesFor(modelName) {
  var fixtures = Promise.resolve(getTestFixtures(modelName));

  var createFixture = Promise.promisify(app.models[modelName].create, app.models[modelName]);

  fixtures.each(function(value) {
    return createFixture(value);
  }).then(function(createdFixtures) {
    console.log('Create ' + createdFixtures.length + ' fixtures for ' + modelName + ': OK');
  })
  .catch(function(err) {
    console.log('Failed to create fixtures for ' + modelName);
    console.log(err);
  }).finally(closeDBConnectionIfImportComplete);
}

_.each(fixturesToImport, function(model) {
  importFixturesFor(model);
});
