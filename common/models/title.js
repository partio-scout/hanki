module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        var Promise = require('bluebird');
        // var loopback = require('loopback');
        var app = require('../../server/server');
        var Titlegroup = app.models.Titlegroup;
        var Account = app.models.Account;
        var Supplier = app.models.Supplier;

        function csvJSON(csv){
          // console.log(csv);
          var lines = csv.split('\\n');
          // console.log(lines[0]);
          // console.log(lines);
          var result = [];
          var headers = lines[0].split(',');
          // console.log(headers);
          for (var i = 1; i < lines.length; i++){
            	  var obj = {};
            	  var currentline = lines[i].split(',');
            	  for (var j = 0; j < headers.length; j++){
              obj[headers[j]] = currentline[j];
            	  }
            	  result.push(obj);
          }
          return result; //JavaScript object
          // return JSON.stringify(result); //JSON
        }

        function titlegroup_exists(obj){
          return new Promise(function(resolve,reject){
              Titlegroup.exists(obj.titlegroupId, function(err, bool){
                  if (err) {
                    reject(new Error('titlegroup_exists ' + new Error (err)));
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
                      reject(new Error('account_exists ' + new Error (err)));
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
                      reject(new Error('supplier_exists ' + new Error (err)));
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
                      console.log(obj);
                      reject(new Error('title_create ' + new Error (err)));
                    } else {
                      // console.log(obj);
                      resolve(true);
                    }
                  });
              });
        }

        var result = csvJSON(csv);
        console.log(result);

        Promise.each(result, function(obj){
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
                                console.log('1',err);
                                cb(err,null);
                              });
                      }, function(err){
                            console.log('2',err);
                            cb(err,null);
                          });
              })
                .then(function(result) {
                    cb(null, result);
                  });

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
