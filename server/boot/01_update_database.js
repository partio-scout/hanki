module.exports = function updateDatabase(server) {
  db = server.datasources.db;
  var isTest = process.env.NODE_ENV === 'test';

  if (!isTest) {
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

    db.setMaxListeners(40);

    if (!db.isActual(modelsToUpdate)) {
      db.autoupdate(modelsToUpdate, function(err) {
        if (err) {
          console.log('Error: '+err+' when autoupdating models: '+modelsToUpdate);
          throw err;
        }
        console.log('Models: '+modelsToUpdate+' updated.');
        db.disconnect();
      });
    };
  };
};
