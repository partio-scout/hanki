var Promise = require('bluebird');

var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var purchaseUser = app.models.Purchaseuser;
var role = app.models.Role;
var costCenter = app.models.Costcenter;
var findRole = Promise.promisify(role.find, role);
var findCostCenter = Promise.promisify(costCenter.find, costCenter);

function collect(value, aggregate) {
  if (aggregate.indexOf(value) === -1) {
    aggregate.push(value);
  }
  return aggregate;
}

var opts = require('commander')
  .usage('<user email> <user role> [<user role>...] [OPTIONS]')
  .option('--costcenter [code]', 'The code of the cost center this user is associated with.', collect, [])
  .option('--controllerOf [code]', 'The code of the cost centers for which this user is the controller.', collect, [])
  .option('--approverOf [code]', 'The code of the cost centers for which this user is the approver.', collect, [])
  .parse(process.argv);

if (opts.args.length < 2) {
  opts.outputHelp();
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

function getCostCenters(costCenterCodes) {
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

Promise.join(
  getRoles(),
  getCostCenters(opts.costcenter),
  getCostCenters(opts.approverOf),
  getCostCenters(opts.controllerOf),
  function (roles, costCenters, costCentersApproverOf, costCentersControllerOf) {
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

    return purchaseUser.createWithRolesAndCostcenters(user, roles, costCenters, costCentersApproverOf, costCentersControllerOf)
      .then(function(userCreationInfo) { return [userCreationInfo, roles]; });
  })
  .spread(function (user, roles) {
    console.log('User created:\n', user);
    console.log('Roles: ', roles.map(function (role) { return role.name; }));
    process.exit(0);
  }, function(err) {
    console.error(err.message + '\n', err.innerException);
    process.exit(1);
  });
