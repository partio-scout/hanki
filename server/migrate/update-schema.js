var app = require('../server.js');
var db = app.datasources.db;

// The order of these models is important for database row creation!
var modelsToUpdate = [
  //'ACL',
  //'AccessToken',
  //'Role',
  //'RoleMapping',
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


modelsToUpdate.map( function(model) {
  db.isActual(model, function(err, actual) {
    if (!actual) {
      console.log('DB not actual - autoupdating model: ' + model + '.');
      db.autoupdate(model, function(err, result) {
        if (err) throw err;
        console.log('Model: '+model+' update result:'+result)
      });
    }
  });
});

console.log('Checked following tables for update: ' + modelsToUpdate + '.');
