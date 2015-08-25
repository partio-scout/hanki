module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        var Parse = require('csv-parse');
        var Promise = require('bluebird');
        var app = require('../../server/server');
        var Titlegroup = app.models.Titlegroup;
        var Account = app.models.Account;
        var Supplier = app.models.Supplier;

        // options for Parse function:
        var options = { columns: true, skip_empty_lines: true, auto_parse: true, delimiter: ',', rowDelimiter: '\\n' };
        function parseInput(csv, options) {
          return new Promise(function(resolve, reject) {
            Parse(csv, options, function(err, output) {
              if (err) reject(new Error(err));
              else {
                resolve(output);
              }
            });
          });
        }

        function titlegroup_exists(obj){
          return new Promise(function(resolve,reject){
              Titlegroup.exists(obj.titlegroupId, function(err, bool){
                  if (err) {
                    reject(new Error(err));
                  } else {
                    if (!bool) {
                      obj.titlegroupId = 0;
                      resolve(true);
                    }
                      else resolve(false);
                  }
                });
            });
        }
        function account_exists(obj){
          return new Promise(function(resolve,reject){
                Account.exists(obj.accountId, function(err, bool){
                    if (err) {
                      reject(new Error(err));
                    } else {
                      if (!bool) {
                        obj.accountId = 0;
                        resolve(true);
                      } else resolve(false);
                    }
                  });
              });
        }
        function supplier_exists(obj){
          return new Promise(function(resolve,reject){
                Supplier.exists(obj.supplierId, function(err, bool){
                    if (err) {
                      reject(new Error(err));
                    } else {
                      if (!bool) {
                        obj.supplierId = 0;
                        resolve(true);
                      } else resolve(false);
                    }
                  });
              });
        }
        function title_create(obj){
          return new Promise(function(resolve,reject){
                Title.create(obj, function(err, obj){
                    if (err) {
                      console.log(obj.titleId);
                      console.log(err);
                      reject(new Error(err));
                    } else {
                      resolve(true);
                    }
                  });
              });
        }
        if (!csv) cb(null, 'Et antanut tietoa.');
        else {
          parseInput(csv, options)
            .each(function(obj){
                  return Promise.all([
                    titlegroup_exists(obj),
                    account_exists(obj),
                    supplier_exists(obj),
                    obj])
                      .then(function(array){
                          title_create(obj)
                              .then(function(obj){
                                return;
                              }, function(err){
                                  // console.log('1',err);
                                  cb(err,null);
                                });
                        }, function(err){
                              // console.log('2',err);
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
