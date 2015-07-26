var app = require('../server');
var request = require('supertest');
var assert = require('assert');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('User control', function() {
  /*
  describe('decline access for unauthenticated users', function() {
    it('should decline access to Accounts for unauthenticated users', function(done) {
      request(app).get('/api/Accounts')
        .expect(401)
        .end(done);
    });

    it('should decline access to Costcenters for unauthenticated users', function(done) {
      request(app).get('/api/Costcenters')
        .expect(401)
        .end(done);
    });

    it('should decline access to Deliveries for unauthenticated users', function(done) {
      request(app).get('/api/Deliveries')
        .expect(401)
        .end(done);
    });

    it('should decline access to Purchaseorderrows for unauthenticated users', function(done) {
      request(app).get('/api/Purchaseorderrows')
        .expect(401)
        .end(done);
    });

    it('should decline access to Purchaseorders for unauthenticated users', function(done) {
      request(app).get('/api/Purchaseorders')
        .expect(401)
        .end(done);
    });

    it('should decline access to Suppliers for unauthenticated users', function(done) {
      request(app).get('/api/Suppliers')
        .expect(401)
        .end(done);
    });

    it('should decline access to Titlegroups for unauthenticated users', function(done) {
      request(app).get('/api/Titlegroups')
        .expect(401)
        .end(done);
    });

    it('should decline access to Titles for unauthenticated users', function(done) {
      request(app).get('/api/Titles')
        .expect(401)
        .end(done);
    });

    it('should decline access to Usageobjects for unauthenticated users', function(done) {
      request(app).get('/api/Usageobjects')
        .expect(401)
        .end(done);
    });
  });
*/

  describe('Orderer', function() {
    var User = app.models.User;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var username = 'test@test.test';
    var userpass = 'test';
    var userid;
    var UserAccesstoken;

    function createTestUser(username, userpass) {
      return new Promise(function (resolve, reject) {
        // create dummy user for testing
        console.log("ASD");
        User.findOrCreate(
          {
            where: {email: username}
          },
          {
            email: username,
            password: userpass
          }, function(err, user) {
            if(err) reject(err);
            console.log("Dummy user created! (or it already existed...)");
            resolve(user); 
        });
      });
    }

    function assignRoleToUser(user) {
      return new Promise(function (resolve, reject) {
        console.log("Role assingment!!");
        return Role.findOne({
          where: {name: 'orderer'}
        }, function(err, role) {
          if(err) throw err;
          return role.principals.create({
            principalType: RoleMapping.USER,
            principalId: user.id
          }, function(err, principal) {
            if(err) throw err;
            resolve();
          });
        });
      });
    }

    function loginUser(username, userpass) {
      return new Promise(function (resolve, reject) {
        // log in as orderer
        console.log("User login attempt");
        return User.login({
          email: username,
          password: userpass
        }, function(err, accessToken) {
          if(err) throw err;
          console.log("Some token here: " + accessToken.id);
          resolve(accessToken);
        });
      });
    }

    // do some testing with authenticated users
    it('should be allowed to get orderlines', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        console.log("Token: " + accessToken.id);
        request(app).get("/api/Purchaseorders?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      });
      
    });
    /*
    it('should be allowed to get ordes', function(done) {
      request(app).get('/api/Purchaseorders?access_token=' + accessToken)
        .expect(200)
        .end(done);
    });
    */

    function logoutUser(accessToken) {
      return new Promise(function (resolve, reject) {
        // logout user
        User.logout(accessToken.id, function(err) {
          if (err) throw err;
        });
        resolve();
      });
    }

    function deleteUser(username) {
      User.destroyAll({email: username}, function(err) {
        if(err) throw err;
      });
    }
/*
    createTestUser(username, userpass)
    .then(assignRoleToUser)
*/
  });

});
