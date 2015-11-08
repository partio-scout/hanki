var app = require('../server.js');
var db = app.datasources.db;
var _ = require('lodash');

var modelsToAutoMigrate = require('../models-list.js');

var fixturesToImport = [
  'Role',
  'Titlegroup',
  'Title',
  'Supplier',
  'Delivery',
  'Costcenter',
  'Purchaseorder',
  'Purchaseorderrow',
  'History',
  'Account'
];

function getFixtures(modelName) {
  return require('../../common/fixtures/all/' + modelName + '.json');
}

var closeDBConnectionIfImportComplete = _.after(fixturesToImport.length, function() {
  app.datasources.db.disconnect();
  console.log('Done.');
});

function importFixturesFor(modelName) {
  var fixtures = getFixtures(modelName);
  app.models[modelName].create(fixtures, function(err, res) {
    console.log('Create ' + fixtures.length + ' fixtures for ' + modelName + ': ' + (err ? ' FAILED' : 'OK'));
    if (err) {
      console.log(err);
    }
    closeDBConnectionIfImportComplete();
  });
}

db.automigrate(modelsToAutoMigrate, function(err) {
  if (err) throw err;

  _.each(fixturesToImport, function(modelName) {
    importFixturesFor(modelName);
  });
});

console.log('Created following tables: ' + modelsToAutoMigrate + '. If they existed earlier, they were dropped and recreated.');

