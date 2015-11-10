var app = require('../../server');
var Promise = require('bluebird');
var expect = require('chai').expect;

function loginUser(username, userpass) {
  userpass = userpass || 'salasana';
  var promiseUserLogin = Promise.promisify(app.models.Purchaseuser.login, app.models.Purchaseuser);
  return promiseUserLogin({
    username: username,
    password: userpass
  });
}

function createFixture(modelName, fixture) {
  var create = Promise.promisify(app.models[modelName].create, app.models[modelName]);
  return create(fixture);
}

function deleteFixtureIfExists(modelName, id) {
  var del = Promise.promisify(app.models[modelName].destroyById, app.models[modelName]);
  return del(id);
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

module.exports = {
  loginUser: loginUser,
  createFixture: createFixture,
  deleteFixtureIfExists: deleteFixtureIfExists,
  expectModelToBeDeleted: expectModelToBeDeleted,
  find: find
};
