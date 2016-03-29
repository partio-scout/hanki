var Promise = require('bluebird');

module.exports = function(Purchaseuser) {
  Purchaseuser.createWithRolesAndCostcenters = function (user, roles, costcenters, costCentersApproverOf, costCentersControllerOf) {
    var app = require('../../server/server');
    var roleMapping = app.models.RoleMapping;
    var createUser = Promise.promisify(Purchaseuser.create, Purchaseuser);
    var createRoleMapping = Promise.promisify(roleMapping.create, roleMapping);

    function wrapError(message) {
      return function(err) {
        var e = new Error(message);
        e.innerException = err;
        throw e;
      };
    }

    function createRoleMappings(user, roles) {
      return Promise.all(roles.map(function (role) { return role.id; }).map(function (roleId) {
        return createRoleMapping({
          'principalType': 'USER',
          'principalId': user.id,
          'roleId': roleId,
        });
      })).catch(wrapError('Couldn\'t create role mapping!'));
    }

    var attachCostCenters = Promise.method(function(user, costCenters) {
      if (costCenters === undefined || costCenters.length === 0) {
        return;
      }

      var addCostCenter = Promise.promisify(user.costcenters.add, user.costcenters);
      return Promise.all(costCenters.map(function(costCenter) { return addCostCenter(costCenter); }))
        .catch(wrapError('Couldn\'t add cost center to user.'));
    });

    function setProperty(model, propertyName, propertyValue) {
      var updateAttribute = Promise.promisify(model.updateAttribute, model);
      return updateAttribute(propertyName, propertyValue);
    }

    function setPropertyForAll(models, propertyName, propertyValue) {
      return Promise.all(models.map(function(model) { return setProperty(model, propertyName, propertyValue); }));
    }

    return createUser(user).catch(wrapError('Couldn\'t create user!'))
      .then(function(userCreationInfo) {
        return attachCostCenters(userCreationInfo, costcenters)
          .then(function() { return createRoleMappings(userCreationInfo, roles); })
          .then(function() { return setPropertyForAll(costCentersApproverOf, 'approverUserId', userCreationInfo.id); })
          .then(function() { return setPropertyForAll(costCentersControllerOf, 'controllerUserId', userCreationInfo.id); })
          .then(function() { return userCreationInfo; });
      });
  };

  Purchaseuser.getRoles = function(id, cb) {
    var app = require('../../server/server');
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var getRoles = Promise.promisify(Role.getRoles, Role);
    var find = Promise.promisify(Role.find, Role);

    getRoles({ principalType: RoleMapping.USER, principalId: id })
      .then(function(roles) { return find({ where: { id: { inq: roles.filter(function(role) { return !isNaN(parseInt(role, 10)); }) } }, fields: { name: true } }); })
      .then(function(roles) { return roles.map(function(role) { return role.name; }); })
      .nodeify(cb);
  };

  Purchaseuser.addCostcenterByCode = function(email, code, cb) {
    var app = require('../../server/server');
    var Costcenter = app.models.Costcenter;

    Promise.join(
      Purchaseuser.findOne({ where: { email: email }, include: 'costcenters' }),
      Costcenter.findOne({ where: { code: code } }),
      function(user, costCenter) {
        if (!user) {
          throw new Error('No such user');
        }
        if (!costCenter) {
          throw new Error('No such cost center');
        }
        return user.costcenters.add(costCenter);
      }).nodeify(cb);
  };

  Purchaseuser.getDevLoginUrl = function(email, opts, cb) {
    var timeToLive = opts.timeToLive || 8*3600;
    var port = opts.port || '3000';

    var query = {
      where: {
        email: email,
      },
    };

    Purchaseuser.findOne(query, function(err, user) {
      if (err) {
        cb(err);
      } else if (user === null) {
        cb(new Error('Can\'t find user: ' + email));
      } else {
        user.createAccessToken(timeToLive, function(err, accessToken) {
          if (err) {
            cb(err);
          } else {
            var url = 'http://localhost:' + port + '/dev-login/' + accessToken.id;
            cb(null, url);
          }
        });
      }
    });
  };

  Purchaseuser.remoteMethod(
    'getRoles',
    {
      accepts: { arg: 'id', type: 'number', required: 'true', http: { source: 'path' } },
      returns: { arg: 'roles', type: 'array' },
      http: { path: '/:id/roles', verb: 'get' },
    });
};
