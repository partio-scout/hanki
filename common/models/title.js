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
        var Title_beginTransaction = Promise.promisify(Title.beginTransaction, Title);
        var AnyErrorsHappened = false;
        // Check if objects property already exists in db; if not, change to 0
        // obj: a Title-object, func: function to check if property exists, property: property to check & change to 0 if it doesn't exist
        function checkIfPropertyExists(obj, func, property) {
          if (func && (typeof func == 'function')){ // Check if passed function actually a function
            return func(obj[property])
            .then(function(exists){
              if (!exists) { // Property doesn't already exist, so change to 0
                obj[property] = 0;
              }
            }, function(err) {
              cb(err,null);
            });
          } else { // passed function not a function
            cb('flawed function', null);
          }
        };
        // options for Parse function:
        var options = { columns: [ 'name', 'titlegroupId', 'unit', 'priceWithoutTax', 'vatPercent', 'priceWithTax', 'accountId', 'supplierId', 'supplierTitlecode', 'toResold', 'toRent', 'toBought', 'toSignedFor', 'memo', 'selectable' ], skip_empty_lines: true, auto_parse: true, delimiter: ',', rowDelimiter: '\\n' };
        if (!csv || (csv === '')) { // input csv is empty; return empty string
          cb(null, '');
        } else {
          var beginTx = Title_beginTransaction({ isolationLevel: Title.Transaction.READ_COMMITTED });
          beginTx.then(function(tx) {
            Parse(csv, options)
              .each(function(obj){
                return Promise.all([
                  checkIfPropertyExists(obj, titlegroupId_exists, 'titlegroupId'),
                  checkIfPropertyExists(obj, accountId_exists, 'accountId'),
                  checkIfPropertyExists(obj, supplierId_exists, 'supplierId'),
                  obj])
                .then(function(array){
                  title_create(obj, { transaction: tx })
                      .then(function(obj){
                        return;
                      }, function(err){
                        AnyErrorsHappened = true;
                        cb(err);
                      });
                }, function(err){
                  AnyErrorsHappened = true;
                  cb(err);
                });
              }, function(err) {
                AnyErrorsHappened = true;
                cb(err);
              })
              .then(function(result) {
                return new Promise(function(res,rej) {
                  if (!AnyErrorsHappened) { // no errors; commit tx
                    tx.commit(function(err) {
                      if (err) {
                        rej(err);
                      } else {
                        res(result);
                      }
                    });
                  } else { // errors; rollback tx
                    tx.rollback(function(err) {
                      if (err) {
                        rej(err);
                      } else {
                        rej();
                      }
                    });
                  }
                })
                .then(function(result) { // no errors, return new objects
                  cb(null,result);
                }, function(err) { // return err
                  cb(err);
                });
              });
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
