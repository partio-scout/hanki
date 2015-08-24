// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('DataImport', function() {
  var User = app.models.User;
  var username = 'orderer';
  var userpass = 'salasana';
  // var template =  result: 0: { name: 'Lauta', titlegroupId: 1, unit: 'm', priceWithoutTax: 32, vatPercent: 14, priceWithTax: 45, accountId: 2, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 0, toRent: 1, toBought: 'FALSE', memo: 'täällä tekstiä', toSignedFor: 'FALSE' }, 1: { name: 'Auto', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 3000, vatPercent: 21, priceWithTax: 3050, accountId: 0, supplierId: 0, supplierTitlecode: 'Autokauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'jotain täälläkin', toSignedFor: 1 }, 2: { name: 'Laiva', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 50000, vatPercent: 21, priceWithTax: 55000, accountId: 2, supplierId: 0, supplierTitlecode: 'Laivakauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'entäs täällä', toSignedFor: 1 }, 3: { name: 'Makuupussi', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 0, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'mitä?', toSignedFor: 1 }, 4: { name: 'Teltta', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 1, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'jotain', toSignedFor: 1 };
  var object1 = { name: 'Lauta', titlegroupId: 1, unit: 'm', priceWithoutTax: 32, vatPercent: 14, priceWithTax: 45, accountId: 2, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 0, toRent: 1, toBought: 'FALSE', memo: 'täällä tekstiä', toSignedFor: 'FALSE' };
//   var template1 = {
// result: [5]
// 0:  {
// name: "Lauta"
// titlegroupId: 1
// unit: "m"
// priceWithoutTax: 32
// vatPercent: 14
// priceWithTax: 45
// accountId: 2
// supplierId: 1
// supplierTitlecode: "Kauppa"
// toResold: 0
// toRent: 1
// toBought: "FALSE"
// memo: "täällä tekstiä"
// toSignedFor: "FALSE"
// }-
// 1:  {
// name: "Auto"
// titlegroupId: 0
// unit: "kpl"
// priceWithoutTax: 3000
// vatPercent: 21
// priceWithTax: 3050
// accountId: 0
// supplierId: 0
// supplierTitlecode: "Autokauppa"
// toResold: 1
// toRent: 1
// toBought: 1
// memo: "jotain täälläkin"
// toSignedFor: 1
// }-
// 2:  {
// name: "Laiva"
// titlegroupId: 1
// unit: "kpl"
// priceWithoutTax: 50000
// vatPercent: 21
// priceWithTax: 55000
// accountId: 2
// supplierId: 0
// supplierTitlecode: "Laivakauppa"
// toResold: 1
// toRent: 1
// toBought: 1
// memo: "entäs täällä"
// toSignedFor: 1
// }-
// 3:  {
// name: "Makuupussi"
// titlegroupId: 1
// unit: "kpl"
// priceWithoutTax: 100
// vatPercent: 21
// priceWithTax: 121
// accountId: 0
// supplierId: 1
// supplierTitlecode: "Kauppa"
// toResold: 1
// toRent: 0
// toBought: 1
// memo: "mitä?"
// toSignedFor: 1
// }-
// 4:  {
// name: "Teltta"
// titlegroupId: 0
// unit: "kpl"
// priceWithoutTax: 100
// vatPercent: 21
// priceWithTax: 121
// accountId: 1
// supplierId: 1
// supplierTitlecode: "Kauppa"
// toResold: 1
// toRent: 0
// toBought: 1
// memo: "jotain"
// toSignedFor: 1
// }-
// -
// };
  function loginUser(username, userpass) {
    return new Promise(function (resolve, reject) {
      return User.login({
        username: username,
        password: userpass
      }, function(err, accessToken) {
        if (err) throw err;

        resolve(accessToken);
      });
    });
  }
  function promiseFind(model, whereClause, includeClause) {
    includeClause = includeClause || null;
    what = { where: whereClause };
    if (includeClause) {
      what = { where: whereClause, include: includeClause };
    }
    return new Promise(function (resolve, reject) {
      model.find(what, function(err, res) {
        console.log(err,res);
        if (err) throw err;
        resolve(res);
      });
    });
  }

  describe('REST API', function() {
    it('should decline access to Titles/DataImport for unauthenticated users', function(done) {
      request(app).get('/api/Titles/DataImport')
        .expect(401)
        .end(done);
    });
    it('should allow access to Titles/Dataimport for authenticated users', function(done) {
      loginUser(username,userpass)
      .then(function(accessToken) {
        request(app).post('/api/Titles/DataImport?access_token=' + accessToken.id)
        // .send({ csv: "name,titlegroupId,unit,priceWithoutTax,vatPercent,priceWithTax,accountId,supplierId,supplierTitlecode,toResold,toRent,toBought,memo,toSignedFor\nLauta,1,m,32,14,45,2,1,Kauppa,0,1,FALSE,'täällä tekstiä',FALSE\nAuto,3,kpl,3000,21,3050,4,3,Autokauppa,1,1,1,'jotain täälläkin',1\nLaiva,1,kpl,50000,21,55000,2,8,Laivakauppa,1,1,1,'entäs täällä',1\nMakuupussi,1,kpl,100,21,121,5,1,Kauppa,1,0,1,mitä?,1\nTeltta,188,kpl,100,21,121,1,1,Kauppa,1,0,1,jotain,1" })
        .send({ csv: null })
        .expect(200)
        .end(done);
      });
    });
    it('result should equal to', function(done) {
      var login = loginUser(username, userpass);
      login.then(function(accessToken) {
        console.log(1, accessToken);
        return new Promise(function(resolve, reject) {
          console.log(2);
          request(app).post('/api/Titles/DataImport?access_token=' + accessToken.id)
          .send({ 'csv': "name,titlegroupId,unit,priceWithoutTax,vatPercent,priceWithTax,accountId,supplierId,supplierTitlecode,toResold,toRent,toBought,memo,toSignedFor\nLauta,1,m,32,14,45,2,1,Kauppa,0,1,FALSE,'täällä tekstiä',FALSE" })
          // .send({ csv: null })
          .expect(200)
          .end(resolve);
        });
      })
      .then(function(asd) {
        console.log(3, asd);
        return promiseFind(app.models.Title, { titleId: 1 });
      })
      .then(function(res){
        expect(JSON.stringify(res.body)).to.equal(JSON.stringify(object1));
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
});
