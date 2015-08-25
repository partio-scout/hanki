var app = require('../server.js');
var db = app.datasources.db;

// The order of these models is important for database row creation!
var modelsToAutoMigrate = [
  'ACL',
  'AccessToken',
  'Role',
  'RoleMapping',
  'User',
  'Title',
  'Titlegroup',
  'Account',
  'Supplier',
  'Delivery',
  'Costcenter',
  'Purchaseuser',
  'Usageobject',
  'Purchaseorder',
  'Purchaseorderrow'
];

db.automigrate(modelsToAutoMigrate, function() {
  var roleFixtures = require('../../common/fixtures/all/Role.json');
  app.models.Role.create(roleFixtures, function(err, res) {
    console.log('Created default roles: ', err, res);
    db.disconnect();
  });
});

console.log('Created following tables: ' + modelsToAutoMigrate + '. If they existed earlier, they were dropped and recreated.');