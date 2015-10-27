module.exports = function updateDatabase(server) {
  var isTest = process.env.NODE_ENV === 'test';
  if (isTest) {
    return;
  };

  db = server.datasources.db;
  var modelsToUpdate = require('../models-list.js');

  db.setMaxListeners(40);
  if (!db.isActual(modelsToUpdate)) {
    db.autoupdate(modelsToUpdate, function(err) {
      if (err) {
        console.error('Error: ' + err + ' when autoupdating models: ' + modelsToUpdate);
        throw err;
      }
      console.log('Models: ' + modelsToUpdate + ' updated.');
      db.disconnect();
    });
  };
};
