module.exports = function(Account) {
  // Check if input objects accountId exists; if not, change it to zero
  Account._exists = function(obj){
    var Promise = require('bluebird');
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
  };
};
