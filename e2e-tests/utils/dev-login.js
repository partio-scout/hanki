var app = require('../../server/server.js');

function devLogin(email, cb) {
  var opts = {
    port: 3005,
  };
  app.models.Purchaseuser.getDevLoginUrl(email, opts, cb);
}

module.exports = devLogin;
