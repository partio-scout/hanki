var app = require('../server.js');
var db = app.datasources.db;

var modelsToAutoMigrate = require('../models-list.js');

db.automigrate(modelsToAutoMigrate, function(err) {
  if (err) throw err;
  var roleFixtures = require('../../common/fixtures/all/Role.json');
  app.models.Role.create(roleFixtures, function(err, res) {
    console.log('Created default roles: ', err, res);
    db.disconnect();
  });
});

console.log('Created following tables: ' + modelsToAutoMigrate + '. If they existed earlier, they were dropped and recreated.');
