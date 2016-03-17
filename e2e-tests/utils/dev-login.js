var app = require('../../server/server.js');

function devLogin(email, cb) {
  var opts = {
    port: 3005,
  };
  app.models.Purchaseuser.getDevLoginUrl('teuvo@tilaa.ja', opts, cb);
}

module.exports = devLogin;
