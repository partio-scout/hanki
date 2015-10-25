var Promise = require('bluebird');

var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var purchaseUser = app.models.Purchaseuser;
var role = app.models.Role;
var roleMapping = app.models.RoleMapping;
var createUser = Promise.promisify(purchaseUser.create, purchaseUser);
var findRole = Promise.promisify(role.find, role);
var createRoleMapping = Promise.promisify(roleMapping.create, roleMapping);

var opts = require('commander')
  .usage('Usage: npm run create-user <user email> <user role> [<user role>...]')
  .parse(process.argv);

if (opts.args.length < 2) {
  console.error('Please provide the user\'s email and at least one role.');
  process.exit(1);
}

function wrapError(message) {
  return function(err) {
    var e = new Error(message);
    e.innerException = err;
    throw e;
  };
}

var roleNames = opts.args.slice(1);

findRole({ where: { name: { inq: roleNames } }, fields: ['id','name'] }).catch(wrapError('Cannot query roles!'))
  .then(function (roles) {
    if (!roles || roles.length !== roleNames.length) {
      throw new Error('Not all of the given roles were found. Given roles: ' + roleNames +
        ', found roles: ' + roles.map(function(role) {return role.name;}));
    }

    return roles.map(function (role) { return role.id; });
  })
  .then(function (roleIds) {
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

    return createUser(user).catch(wrapError('Couldn\'t create user!'))
      .then(function(userInfo) { return [userInfo, roleIds]; });
  })
  .spread(function (userInfo, roleIds) {
    return Promise.all(roleIds.map(function (roleId) {
      return createRoleMapping({
        'principalType': 'USER',
        'principalId': userInfo.id,
        'roleId': roleId
      });
    })).catch(wrapError('Couldn\' create role mapping!')).then(function() { return userInfo; });
  })
  .then(function (user) {
    console.log('User created:\n', user);
    console.log('Roles: ', roleNames);
    process.exit(0);
  }, function(err) {
    console.error(err.message + '\n', err.innerException);
    process.exit(1);
  });
