module.exports = function(Titlegroup){
  // Check if input objects titlegroupId exists; if not, change it to zero
  Titlegroup._exists = function(obj){
    var Promise = require('bluebird');
    return new Promise(function(resolve,reject){
        Titlegroup.exists(obj.titlegroupId, function(err, bool){
            if (err) {
              reject(new Error(err));
            } else {
              if (!bool) {
                obj.titlegroupId = 0;
                resolve(true);
              } else resolve(false);
            }
          });
      });
  };
};
