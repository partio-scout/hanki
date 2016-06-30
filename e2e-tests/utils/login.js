var app = require('../../server/server.js');

function login(email, cb) {
  var opts = {
    host: 'http://localhost:3005',
  };
  app.models.Purchaseuser.getLoginUrl(email, opts, cb);
}

module.exports = login;
