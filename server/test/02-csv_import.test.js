// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
// var expect = require('chai').expect;
var Promise = require('bluebird');

describe('DataImport', function() {
  var User = app.models.User;
  var username = 'orderer';
  var userpass = 'salasana';
  // var template =  result: 0: { name: 'Lauta', titlegroupId: 1, unit: 'm', priceWithoutTax: 32, vatPercent: 14, priceWithTax: 45, accountId: 2, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 0, toRent: 1, toBought: 'FALSE', memo: 'täällä tekstiä', toSignedFor: 'FALSE' }, 1: { name: 'Auto', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 3000, vatPercent: 21, priceWithTax: 3050, accountId: 0, supplierId: 0, supplierTitlecode: 'Autokauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'jotain täälläkin', toSignedFor: 1 }, 2: { name: 'Laiva', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 50000, vatPercent: 21, priceWithTax: 55000, accountId: 2, supplierId: 0, supplierTitlecode: 'Laivakauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'entäs täällä', toSignedFor: 1 }, 3: { name: 'Makuupussi', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 0, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'mitä?', toSignedFor: 1 }, 4: { name: 'Teltta', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 1, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'jotain', toSignedFor: 1 };
  // var object1 = { name: 'Lauta', titlegroupId: 1, unit: 'm', priceWithoutTax: 32, vatPercent: 14, priceWithTax: 45, accountId: 2, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 0, toRent: 1, toBought: 'FALSE', memo: 'täällä tekstiä', toSignedFor: 'FALSE' };

  function loginUser(username, userpass) {
    return new Promise(function (resolve, reject) {
      return User.login({
        username: username,
        password: userpass
      }, function(err, accessToken) {
        if (err) throw err;
        // console.log(accessToken);
        if (!accessToken) reject(err);
        else resolve(accessToken);
      });
    });
  }
  function createUser(username,pass) {
    return new Promise(function (resolve, reject) {
      return User.create({
        username: username,
        password: pass,
        email: 'user@foo.fi'
      }, function(err, obj) {
        if (err) throw err;
        // console.log(obj);
        resolve(obj);
      });
    });
  }
  // function promiseFind(model, whereClause, includeClause) {
  //   includeClause = includeClause || null;
  //   what = { where: whereClause };
  //   if (includeClause) {
  //     what = { where: whereClause, include: includeClause };
  //   }
  //   return new Promise(function (resolve, reject) {
  //     model.find(what, function(err, res) {
  //       console.log(err,res);
  //       if (err) throw err;
  //       resolve(res);
  //     });
  //   });
  // }

  describe('REST API', function() {
    it('should decline access to Titles/DataImport for unauthenticated users', function(done) {
      request(app).get('/api/Titles/DataImport')
        .expect(401)
        .end(done);
    });
    it('should allow access to Titles/Dataimport for authenticated users', function(done) {
      createUser(username, userpass)
      .then(function(user) {
        loginUser(username, userpass)
      .then(function(accessToken) {
          // console.log(accessToken);
          request(app).post('/api/Titles/DataImport?access_token=' + accessToken.id)
        .expect(function(res) {
            console.log(res.body);
          })
        .expect(200)
        .end(done);
        });
      });
    });
    it('result should print on console', function(done) {
      var login = loginUser(username, userpass);
      login.then(function(accessToken) {
          // console.log(accessToken);
          request(app).post('/api/Titles/DataImport?access_token=' + accessToken.id + '&csv=name%2CtitlegroupId%2Cunit%2CpriceWithoutTax%2CvatPercent%2CpriceWithTax%2CaccountId%2CsupplierId%2CsupplierTitlecode%2CtoResold%2CtoRent%2CtoBought%2Cmemo%2CtoSignedFor%5CnLauta%2C1%2Cm%2C32%2C14%2C45%2C2%2C1%2CKauppa%2C0%2C1%2CFALSE%2C%22t%C3%A4%C3%A4ll%C3%A4+teksti%C3%A4%22%2CFALSE%5CnAuto%2C3%2Ckpl%2C3000%2C21%2C3050%2C4%2C3%2CAutokauppa%2C1%2C1%2C1%2C%22jotain+t%C3%A4%C3%A4ll%C3%A4kin%22%2C1%5CnLaiva%2C1%2Ckpl%2C50000%2C21%2C55000%2C2%2C8%2CLaivakauppa%2C1%2C1%2C1%2C%22ent%C3%A4s+t%C3%A4%C3%A4ll%C3%A4%22%2C1%5CnMakuupussi%2C1%2Ckpl%2C100%2C21%2C121%2C5%2C1%2CKauppa%2C1%2C0%2C1%2Cmit%C3%A4%3F%2C1%5CnTeltta%2C188%2Ckpl%2C100%2C21%2C121%2C1%2C1%2CKauppa%2C1%2C0%2C1%2Cjotain%2C1&')
          .expect(200)
          .expect(function(res) {
            console.log(res.body);
          })
          .end(done);
        }).catch(function(err) {
          console.log(err);
        });
    });
    it('result should print on screen', function(done) {
      var login = loginUser(username, userpass);
      login.then(function(accessToken) {
        // console.log(accessToken);
        request(app).get('/api/Titles?access_token=' + accessToken.id)
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
        })
        .end(done);
      });
    });
      // Promise.join(login, find, function(res) {
      //   expect(JSON.stringify(res.body)).to.equal(JSON.stringify(object1));
      // });
  });
    // it('result should equal', function(done) {
    //     var login = loginUser(username, userpass);
    //     var find = login.then(function(accessToken) {
    //       return promiseFind(app.models.Title);
    //     });
    //     Promise.join(login, find, function(accessToken) {
    //       request(app)
    //         .get('/api//Titles?access_token=' + accessToken.id)
    //         .query({ access_token: accessToken.id })
    //         .expect(200)
    //         .expect(function(res) {
    //           // there must be better way to compare between two JSON arrays
    //           // (or 'template' just has some interesting contents which doesn't allow comparing them directly)
    //           // i.e. this doesn't work
    //           // expect(res.body).to.deep.have.members(template);
    //           expect(JSON.stringify(res.body)).to.equal(JSON.stringify(template));
    //         })
    //         .end(done);
    //     });
    //   });
});
