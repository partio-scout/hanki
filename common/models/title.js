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
        if (!csv) cb(null, '');
        else {
          parseInput(csv, options)
            .each(function(obj){
                  return Promise.all([
                    Titlegroup._exists(obj),
                    Account._exists(obj),
                    Supplier._exists(obj),
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
