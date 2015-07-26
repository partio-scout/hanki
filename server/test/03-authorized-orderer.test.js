var app = require('../server');
var request = require('supertest');
var assert = require('assert');
var expect = require('chai').expect;
var Promise = require('bluebird');



describe('Orderer', function() {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  var username = 'orderer';
  var userpass = 'salasana';
  var userid;
  var UserAccesstoken;

  function createTestUser(username, userpass) {
    return new Promise(function (resolve, reject) {
      // create dummy user for testing
      User.findOrCreate(
        {
          where: {username: username}
        },
        {
          username: username,
          password: userpass
        }, function(err, user) {
          if(err) reject(err);
          //console.log("Dummy user created! (or it already existed...)");
          resolve(user); 
      });
    });
  }

  function assignRoleToUser(user) {
    return new Promise(function (resolve, reject) {
      //console.log("Role assingment!!");
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
      //console.log("User login attempt");
      return User.login({
        username: username,
        password: userpass
      }, function(err, accessToken) {
        if(err) throw err;
        //console.log("Some token here: " + accessToken.id);
        resolve(accessToken);
      });
    });
  }

  function logoutUser(accessToken) {
    return new Promise(function (resolve, reject) {
      // logout user
      User.logout(accessToken.id, function(err) {
        if (err) throw err;
      });
      resolve();
    });
  }

  describe('should be allowed to', function() {

    // do some testing with authenticated users
    it('get list of Accounts', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Accounts?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Costcenters', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Costcenters?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Deliveries', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Deliveries?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Suppliers', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Suppliers?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Titlegroups', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Titlegroups?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Titles', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Titles?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Usageobjects', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Usageobjects?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Purchaseorders', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Purchaseorders?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });
/*
    it('create new Purchaseorder', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).post
      })
    });*/
  });
});
