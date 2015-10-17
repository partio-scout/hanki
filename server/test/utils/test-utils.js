var app = require('../../server');
var Promise = require('bluebird');

function loginUser(username, userpass) {
  userpass = userpass || 'salasana';
  var promiseUserLogin = Promise.promisify(app.models.Purchaseuser.login, app.models.Purchaseuser);
  return promiseUserLogin({
    username: username,
    password: userpass
  });
}

module.exports.loginUser = loginUser;
