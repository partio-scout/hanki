var app = require('../../server');
var Promise = require('bluebird');
var expect = require('chai').expect;
var _ = require('lodash');

function loginUser(username, userpass) {
  userpass = userpass || 'salasana';
  var promiseUserLogin = Promise.promisify(app.models.Purchaseuser.login, app.models.Purchaseuser);
  return promiseUserLogin({
    username: username,
    password: userpass,
  });
}

function createFixture(modelName, fixture) {
  var create = Promise.promisify(app.models[modelName].create, app.models[modelName]);
  return create(fixture);
}

function getRolesByName(roleNames) {
  return Promise.all(_.map(roleNames, function(roleName) {
    return app.models.Role.findOne({ where: { name: roleName } });
  }));
}

function createUserWithRoles(rolesToAdd, userData) {
  var defaultData = {
    memberNumber: '123456',
    name: 'Eric Example',
    phone: '+358501234567',
    email: 'test@example.org',
    enlistment: 'Enlistment',
    userSection: 'Section',
    password: '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC',
    username: 'testuser',
  };
  var user;

  return Promise.join(
    getRolesByName(rolesToAdd),
    createFixture('Purchaseuser', _.merge(defaultData, userData)),
    function(roles, createdUser) {
      user = createdUser;
      return _.map(roles, function(role) {
        return {
          'principalType': 'USER',
          'principalId': user.id,
          'roleId': role.id,
        };
      });
    })
  .then(function(roleMappings) {
    return createFixture('RoleMapping', roleMappings);
  })
  .then(function() {
    return user;
  });
}

function deleteFixtureIfExists(modelName, id) {
  var del = Promise.promisify(app.models[modelName].destroyById, app.models[modelName]);
  return del(id);
}

function deleteFixturesIfExist(modelName, whereClause) {
  var del = Promise.promisify(app.models[modelName].destroyAll, app.models[modelName]);
  return del(whereClause);
}

function expectModelToBeDeleted(modelName, id, cb) {
  return function() {
    app.models[modelName].findById(id, function(err, res) {
      expect(err).to.be.undefined;
      expect(res).to.be.null;
      cb();
    });
  };
}

function find(modelName, whereClause, includeClause) {
  var what = { where: whereClause, include: includeClause };
  var find = Promise.promisify(app.models[modelName].find, app.models[modelName]);
  return find(what);
}

function findById(modelName, id) {
  return Promise.promisify(app.models[modelName].findById, app.models[modelName])(id);
}

module.exports = {
  loginUser: loginUser,
  createFixture: createFixture,
  createUserWithRoles: createUserWithRoles,
  deleteFixtureIfExists: deleteFixtureIfExists,
  deleteFixturesIfExist: deleteFixturesIfExist,
  expectModelToBeDeleted: expectModelToBeDeleted,
  find: find,
  findById: findById,
};
