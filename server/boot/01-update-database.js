var Promise = require('bluebird');

module.exports = function updateDatabase(server, cb) {
  if (!server.get('standalone')) {
    return cb();
  };

  var db = server.datasources.db;
  var isActual = Promise.promisify(db.isActual, db);
  var autoupdate = Promise.promisify(db.autoupdate, db);

  var modelsToUpdate = require('../models-list.js');

  db.setMaxListeners(40);
  isActual(modelsToUpdate).then(function(actual) {
    if (actual) {
      console.log('Database models are up to date.');
      return Promise.resolve();
    } else {
      return autoupdate(modelsToUpdate)
        .then(function() {
          console.log('Models: ' + modelsToUpdate + ' updated.');
        }, function(err) {
          console.log('Error: ' + err + ' when autoupdating models: ' + modelsToUpdate);
          throw err;
        });
    }
  })
  .nodeify(cb);
};
