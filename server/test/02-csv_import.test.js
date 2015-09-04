// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
// var Promise = require('bluebird');
// var expect = require('chai').expect;
// var template = require('./template.json');
var str1 = 'name,titlegroupId,unit,priceWithoutTax,vatPercent,priceWithTax,accountId,supplierId,supplierTitlecode,toResold,toRent,toBought,memo,toSignedFor\nLauta,13,m,32,14,45,29,17,Kauppa,0,1,1,"täällä tekstiä",1\nAuto,3,kpl,3000,21,3050,4,3,Autokauppa,1,1,1,"jotain täälläkin",1\nLaiva,1,kpl,50000,21,55000,2,8,Laivakauppa,1,1,1,"entäs täällä",1\nMakuupussi,1,kpl,100,21,121,5,1,Kauppa,1,0,1,mitä?,1\nTeltta,188,kpl,100,21,121,1,1,Kauppa,1,0,1,jotain,1';

describe('DataImport', function() {
  // var User = app.models.User;
  // var username = 'orderer';
  // var userpass = 'salasana';

  // function loginUser(username, userpass) {
  //   return new Promise(function (resolve, reject) {
  //     return User.login({
  //       username: username,
  //       password: userpass
  //     }, function(err, accessToken) {
  //       if (err) throw err;
  //       // console.log(accessToken);
  //       if (!accessToken) reject(err);
  //       else resolve(accessToken);
  //     });
  //   });
  // }
  // function createUser(username,pass) {
  //   return new Promise(function (resolve, reject) {
  //     return User.create({
  //       username: username,
  //       password: pass,
  //       email: 'user@foo.fi'
  //     }, function(err, obj) {
  //       if (err) throw err;
  //       // console.log(obj);
  //       resolve(obj);
  //     });
  //   });
  // }
  describe('REST API', function() {
    it('should decline access for unauthenticated users', function(done) {
      request(app).post('api/Titles/DataImport')
      .query({ access_token: 0 })
      .send(str1)
      .expect(401)
      .end(done);
    });
  });
});
