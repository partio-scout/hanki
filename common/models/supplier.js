module.exports = function(Supplier) {
  // Check if input objects supplierId exists; if not, change it to zero
  Supplier._exists = function(obj){
    var Promise = require('bluebird');
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
  };
};
