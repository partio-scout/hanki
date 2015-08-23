var _ = require('lodash');
var app = require('../server.js');

function getTestFixtures(modelName) {
  return require('../../common/fixtures/test-only/' + modelName + '.json');
}

function importFixturesFor(modelName) {
  var fixtures = getTestFixtures(modelName);
  app.models[modelName].create(fixtures, function(err, res) {
  	console.log('Create ' + fixtures.length + ' fixtures for ' + modelName + ': ' + (err ? ' FAILED' : 'OK'));
  	if(err) {
  	  console.log(err);
  	}
  	closeDBConnectionIfImportComplete();
  });
}

var fixturesToImport = [
  'Account',
  'Titlegroup',
  'Supplier',
  'Delivery',
  'Costcenter',
  'Purchaseuser',
  'Usageobject',
  'Purchaseorder'
];

var closeDBConnectionIfImportComplete = _.after(fixturesToImport.length, function() {
  app.datasources.db.disconnect();
  console.log('Done.');
});

_.each(fixturesToImport, function(model) {
  importFixturesFor(model);
});
