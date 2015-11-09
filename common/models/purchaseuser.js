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
          'roleId': roleId
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
      return Promise.all(models.map(function(model) { return setProperty(model, propertyName, propertyValue); }));
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
};
