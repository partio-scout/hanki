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

function createFixture(modelName, fixture, cb) {
  app.models[modelName].create(fixture, function(err, res) {
    if (err) {
      throw new Error('Unable to create ' + modelName + ' fixture: ' + err);
    } else {
      cb();
    }
  });
}

function deleteFixtureIfExists(modelName, id, cb) {
  app.models[modelName].destroyById(id, cb());
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

module.exports = {
  loginUser: loginUser,
  createFixture: createFixture,
  deleteFixtureIfExists: deleteFixtureIfExists,
  expectModelToBeDeleted: expectModelToBeDeleted
};
