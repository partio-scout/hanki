// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('DataImport', function() {
  var User = app.models.User;
  var username = 'orderer';
  var userpass = 'salasana';
  var template =  [ { name: 'Lauta', titlegroupId: 0, unit: 'm', priceWithoutTax: 32, vatPercent: 14, priceWithTax: 45, accountId: 0, supplierId: 0, supplierTitlecode: 'Kauppa', toResold: false, toRent: true, toBought: false, memo: 'täällä tekstiä', selectable: null, toSignedFor: false, titleId: 1 } ];
  // , { name: 'Auto', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 3000, vatPercent: 21, priceWithTax: 3050, accountId: 0, supplierId: 0, supplierTitlecode: 'Autokauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'jotain täälläkin', toSignedFor: 1, titleId: 2, selectable: null, }, { name: 'Laiva', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 50000, vatPercent: 21, priceWithTax: 55000, accountId: 2, supplierId: 0, supplierTitlecode: 'Laivakauppa', toResold: 1, toRent: 1, toBought: 1, memo: 'entäs täällä', selectable: null, toSignedFor: 1, titleId: 3 }, { name: 'Makuupussi', titlegroupId: 1, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 0, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'mitä?', selectable: null, toSignedFor: 1, titleId: 4 }, { name: 'Teltta', titlegroupId: 0, unit: 'kpl', priceWithoutTax: 100, vatPercent: 21, priceWithTax: 121, accountId: 1, supplierId: 1, supplierTitlecode: 'Kauppa', toResold: 1, toRent: 0, toBought: 1, memo: 'jotain', selectable: null, toSignedFor: 1, titleId: 5 } ];
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
  // following functions to compare objects taken from https://stamat.wordpress.com/2013/06/22/javascript-object-comparison/
  //Returns the object's class, Array, Date, RegExp, Object are of interest to us
  var getClass = function(val) {
    return Object.prototype.toString.call(val)
  		.match(/^\[object\s(.*)\]$/)[1];
  };
  //Defines the type of the value, extended typeof
  var whatis = function(val) {
    if (val === undefined)
      return 'undefined';
    if (val === null)
      return 'null';
    var type = typeof val;
    if (type === 'object')
      type = getClass(val).toLowerCase();
    if (type === 'number') {
      if (val.toString().indexOf('.') > 0)
        return 'float';
    	else
    		return 'integer';
    }
    return type;
  };
  /*
   * Are two values equal, deep compare for objects and arrays.
   * @param a {any}
   * @param b {any}
   * @return {boolean} Are equal?
   */
  var _equal = {};
  var equal = function(a, b) {
    if (a !== b) {
      var atype = whatis(a), btype = whatis(b);

      if (atype === btype)
        return _equal.hasOwnProperty(atype) ? _equal[atype](a, b) : a==b;

      return false;
    }
    return true;
  };
  var compareObjects = function(a, b) {
    if (a === b)
      return true;
    for (var i in a) {
      if (b.hasOwnProperty(i)) {
        if (!equal(a[i],b[i])) return false;
      } else {
        return false;
      }
    }
    for (var i in b) {
      if (!a.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  };
  var compareArrays = function(a, b) {
    if (a === b)
      return true;
    if (a.length !== b.length)
      return false;
    for (var i = 0; i < a.length; i++){
      if (!equal(a[i], b[i])) return false;
    };
    return true;
  };
  _equal.array = compareArrays;
  _equal.object = compareObjects;
  _equal.date = function(a, b) {
    return a.getTime() === b.getTime();
  };
  _equal.regexp = function(a, b) {
    return a.toString() === b.toString();
  };
  //	uncoment to support function as string compare
  //	_equal.fucntion =  _equal.regexp;
  //
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
          request(app).post('/api/Titles/DataImport?access_token=' + accessToken.id + '&csv=name%2CtitlegroupId%2Cunit%2CpriceWithoutTax%2CvatPercent%2CpriceWithTax%2CaccountId%2CsupplierId%2CsupplierTitlecode%2CtoResold%2CtoRent%2CtoBought%2Cmemo%2CtoSignedFor%5CnLauta%2C13%2Cm%2C32%2C14%2C45%2C29%2C17%2CKauppa%2C0%2C1%2C0%2C%22t%C3%A4%C3%A4ll%C3%A4+teksti%C3%A4%22%2C0%5Cn')
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
          // console.log(res.body[0]);
          // console.log(template[0]);
          expect(equal(template[0], res.body[0])).to.equal(true);
        })
        .end(done);
      });
    });
  });
});
