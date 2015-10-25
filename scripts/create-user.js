var Promise = require('bluebird');

var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var purchaseUser = app.models.Purchaseuser;
var roleMapping = app.models.RoleMapping;
var createUser = Promise.promisify(purchaseUser.create, purchaseUser);
var createRoleMapping = Promise.promisify(roleMapping.create, roleMapping);

var opts = require('commander')
  .usage('Usage: npm run create-user <user email>')
  .parse(process.argv);

if (opts.args.length < 1) {
  console.error('Please provide the user\'s email.');
  process.exit(1);
}

function wrapError(message) {
  return function(err) {
    var e = new Error(message);
    e.innerException = err;
    throw e;
  };
}

var email = opts.args[0];
var password = crypto.randomBytes(24).toString('hex');

var user = {
  email: email,
  password: password,
  name: 'n/a',
  phone: 'n/a',
  enlistment: 'n/a',
  userSection: 'n/a'
};

createUser(user).catch(wrapError('Couldn\'t create user!'))
  .then(function (info) {
    return createRoleMapping({
      'principalType': 'USER',
      'principalId': user.id,
      'roleId': 1
    }).catch(wrapError('Couldn\' create role mapping!'));
  })
  .then(function () {
    console.log('User created:\n', user);
    process.exit(0);
  }, function(err) {
    console.error(err.message + '\n', err.innerException);
    process.exit(1);
  });
