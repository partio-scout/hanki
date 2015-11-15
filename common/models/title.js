module.exports = function(Title) {
  Title.DataImport = function(csv,cb){
    var Promise = require('bluebird');
    var app = require('../../server/server');
    var Parse = Promise.promisify(require('csv-parse'));
    var Titlegroup = app.models.Titlegroup;
    var Account = app.models.Account;
    var Supplier = app.models.Supplier;
    var titlegroup_findOne = Promise.promisify(Titlegroup.findOne, Titlegroup);
    var account_findOne = Promise.promisify(Account.findOne, Account);
    var supplier_findOne = Promise.promisify(Supplier.findOne, Supplier);
    var title_create = Promise.promisify(Title.create, Title);
    var Title_beginTransaction = Promise.promisify(Title.beginTransaction, Title);

    // Check if titles property already exists in db; if not, change to 0
    // title: a Title-object, func: function to check if property exists, property: property to check & change to 0 if it doesn't exist
    function replaceNameInPropertyWithId(title, func, property) {
      if (func && (typeof func == 'function')){ // Check if passed function actually a function
        return func({ where: { name: title[property] } }).then(function(model) {
          if (model === null) {
            //res.status(422);
            var err = new Error('Could not find ' + property + ' ' + title[property] + ' for title ' + title.name);
            err.status = 422;
            throw err;
          } else {
            title[property] = model[property];
          }
        }, function(err) {
          cb(err,null);
        });
      } else { // passed function not a function
        cb('flawed function', null);
      }
    };

    // options for Parse function:
    var options = { columns: [ 'name', 'titlegroupId', 'unit', 'vatPercent', 'priceWithTax', 'accountId', 'supplierId', 'supplierTitlecode', 'toResold', 'toRent', 'toBought', 'toSignedFor', 'memo', 'selectable' ], skip_empty_lines: true, auto_parse: true, delimiter: ',', rowDelimiter: '\n' };
    if (!csv || (csv === '')) { // input csv is empty; return empty string
      cb(null, '');
    } else {
      var beginTx = Title_beginTransaction({ isolationLevel: Title.Transaction.READ_COMMITTED });
      beginTx.then(function(tx) {
        Parse(csv, options).each(function(title){
          return Promise.all([
            replaceNameInPropertyWithId(title, titlegroup_findOne, 'titlegroupId'),
            replaceNameInPropertyWithId(title, account_findOne, 'accountId'),
            replaceNameInPropertyWithId(title, supplier_findOne, 'supplierId'),
            title
          ]).then(function(array) {
            return title_create(title, { transaction: tx });
          });
        }).then(function(result) { // titles created successfully
          tx.commit(function(txError) {
            txError ? cb(txError) : cb(null,result);
          });
        }).catch(function(error) { // at least some failures in CSV read or title creation -> rollback all
          tx.rollback(function(txError) {
            txError ? cb(txError) : cb(error);
          });
        });
      })
      .catch(function(error) {
        cb(error);
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
