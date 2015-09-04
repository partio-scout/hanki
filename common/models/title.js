module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        var Promise = require('bluebird');
        var app = require('../../server/server');
        var Parse = Promise.promisify(require('csv-parse'));
        var Titlegroup = app.models.Titlegroup;
        var Account = app.models.Account;
        var Supplier = app.models.Supplier;
        var titlegroupId_exists = Promise.promisify(Titlegroup.exists, Titlegroup);
        var accountId_exists = Promise.promisify(Account.exists, Account);
        var supplierId_exists = Promise.promisify(Supplier.exists, Supplier);
        var title_create = Promise.promisify(Title.create, Title);
        // Check if objects property already exists in db; if not, change to 0
        // obj: a Title-object, func: function to check if property exists, property: property to check & change to 0 if it doesn't exist
        function checkIfPropertyExists(obj, func, property) {
          // Check if passed function actually a function
          if (func && (typeof func == 'function')){
            return func(obj[property])
            .then(function(exists){
              if (!exists) {
                // Property doesn't already exist, so change to 0
                obj[property] = 0;
              }
            }, function(err) {
              cb(err,null);
            });
          } else {
            // passed function not a function
            cb('faulty function', null);
          }
        };
        // options for Parse function:
        var options = { columns: true, skip_empty_lines: true, auto_parse: true, delimiter: ',', rowDelimiter: '\\n' };
        if (!csv) cb(null, '');
        else {
          Parse(csv, options)
            .each(function(obj){
                  return Promise.all([
                    checkIfPropertyExists(obj, titlegroupId_exists, 'titlegroupId'),
                    checkIfPropertyExists(obj, accountId_exists, 'accountId'),
                    checkIfPropertyExists(obj, supplierId_exists, 'supplierId'),
                    obj])
                      .then(function(array){
                          title_create(obj)
                              .then(function(obj){
                                return;
                              }, function(err){
                                  cb(err,null);
                                });
                        }, function(err){
                              cb(err,null);
                            });
                })
                  .then(function(result) {
                      cb(null, result);
                    });
        }
      };

    Title.remoteMethod(
        'DataImport',
      {
        http: { path: '/DataImport', verb: 'post' },
        accepts: { arg: 'csv', type: 'string' },
        returns: { arg: 'result', type: 'string' }
      }
    );
  };
