var app = require('../server.js');
var db = app.datasources.db;

// The order of these models is important for database row creation!
var modelsToUpdate = [
  'ACL',
  'AccessToken',
  'Role',
  'RoleMapping',
  'Purchaseuser',
  'Title',
  'Titlegroup',
  'Account',
  'Supplier',
  'Delivery',
  'Costcenter',
  'Purchaseorder',
  'Purchaseorderrow'
];

db.setMaxListeners(20);

db.autoupdate(modelsToUpdate, function(err) {
  if (err) {
    console.log('Error: '+err+' when autoupdating models: '+modelsToUpdate);
    throw err;
  }
  console.log('Models: '+modelsToUpdate+' updated.');
  db.disconnect();
});
