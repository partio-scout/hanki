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
  return new Promise(function(resolve, reject) {
    app.models[modelName].create(fixture, function(err, res) {
      if (err) {
        reject(new Error('Unable to create ' + modelName + ' fixture: ' + err));
      } else {
        resolve();
      }
    });
  });
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
