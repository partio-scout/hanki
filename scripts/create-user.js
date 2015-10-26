var Promise = require('bluebird');

var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var purchaseUser = app.models.Purchaseuser;
var role = app.models.Role;
var roleMapping = app.models.RoleMapping;
var costCenter = app.models.Costcenter;
var createUser = Promise.promisify(purchaseUser.create, purchaseUser);
var findRole = Promise.promisify(role.find, role);
var createRoleMapping = Promise.promisify(roleMapping.create, roleMapping);
var findCostCenter = Promise.promisify(costCenter.find, costCenter);

function collect(value, aggregate) {
  aggregate.push(value);
  return aggregate;
}

var opts = require('commander')
  .usage('Usage: npm run create-user <user email> <user role> [<user role>...]')
  .option('--costcenter [code]', 'The code of the cost center this user is associated with.', collect, [])
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

function getRoles() {
  var roleNames = opts.args.slice(1);

  return findRole({ where: { name: { inq: roleNames } }, fields: ['id','name'] }).catch(wrapError('Cannot query roles!'))
    .then(function (roles) {
      if (!roles || roles.length !== roleNames.length) {
        throw new Error('Not all of the given roles were found. Given roles: ' + roleNames +
          ', found roles: ' + roles.map(function (role) {return role.name;}));
      }

      return roles;
    });
}

function getCostCenters() {
  var costCenterCodes = opts.costcenter;

  if (costCenterCodes === undefined || costCenterCodes.length === 0) {
    return Promise.resolve([]);
  }

  return findCostCenter({ where: { code: { inq: costCenterCodes } } }).catch(wrapError('Cannot query cost centers!'))
    .then(function (costCenters) {
      if (!costCenters || costCenters.length !== costCenterCodes.length) {
        throw new Error('Not all of the given cost centers were found. Given codes: ' + costCenterCodes +
          ', found codes: ' + costCenters.map(function (costCenter) { return costCenter.code; }));
      }
      return costCenters;
    });
}

function createRoleMappings(user, roles) {
  return Promise.all(roles.map(function (role) { return role.id; }).map(function (roleId) {
    return createRoleMapping({
      'principalType': 'USER',
      'principalId': user.id,
      'roleId': roleId
    });
  })).catch(wrapError('Couldn\' create role mapping!'));
}

function attachCostCenters(user, costCenters) {
  if (costCenters === undefined || costCenters.length === 0) {
    return Promise.resolve();
  }

  var addCostCenter = Promise.promisify(user.costcenters.add, user.costcenters);
  return Promise.all(costCenters.map(addCostCenter))
    .catch(wrapError('Couldn\'t add cost center to user.'));
}

getRoles()
  .then(function (roles) {
    return getCostCenters().then(function (costCenters) { return [roles, costCenters]; });
  })
  .spread(function (roles, costCenters) {
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
      .then(function(userInfo) { return [userInfo, roles, costCenters]; });
  })
  .spread(function (user, roles, costCenters) {
    return Promise.join(createRoleMappings(user, roles), attachCostCenters(user, costCenters), function() { return [user, roles]; });
  })
  .spread(function (user, roles) {
    console.log('User created:\n', user);
    console.log('Roles: ', roles.map(function (role) { return role.name; }));
    process.exit(0);
  }, function(err) {
    console.error(err.message + '\n', err.innerException);
    process.exit(1);
  });
