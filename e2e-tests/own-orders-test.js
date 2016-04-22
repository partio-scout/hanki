var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');
var Promise = require('bluebird');
var app = require('../server/server');
var testUtils = require('../server/test/utils/test-utils');
var request = require('supertest');
var expect = require('chai').expect;

describe('Own orders', function() {
  var loginUrl, userId, orderId, orderrowId, accessToken;
  var purchaseUser = app.models.Purchaseuser;
  var findCostcenter = Promise.promisify(app.models.Costcenter.find, app.models.Costcenter);
  var findRole = Promise.promisify(app.models.Role.find, app.models.Role);

  before(appRunner.run);

  beforeEach(function(done) {
    return Promise.join(
      findCostcenter({ where: { code: '00000' } }),
      findRole({ where: { name: 'orderer' } }),
      function (ccs, roles) {
        return purchaseUser.createWithRolesAndCostcenters({
          memberNumber: '0000010',
          username: 'newOrderer',
          password: 'salasana',
          name: 'Tanja Tilaaja',
          phone: '050 2345678',
          email: 'tanja@tilaa.ja',
          enlistment: 'Ostaja',
          userSection: 'Palvelut',
        }, roles, ccs, [], []);
      }).then(function(user) {
        userId = user.id;
        return testUtils.loginUser('newOrderer');
      }).then(function(newAccessToken) {
        accessToken = newAccessToken;
        return request(app).post('/api/Purchaseorders?access_token=' + accessToken.id)
        .send({
          'name': 'Tanjan tilaus',
          'costcenterId': 1,
          'subscriberId': accessToken.userId,
        })
        .expect(200)
        .expect(function(res) {
          orderId = res.body.orderId;
        });
      }).then(function() {
        var d = new Date().toISOString();
        return request(app).post('/api/Purchaseorderrows?access_token=' + accessToken.id)
        .send({
          'titleId': 2,
          'amount': 2026,
          'deliveryId': 1,
          'orderId': orderId,
          'approved': false,
          'finished': false,
          'modified': d,
        })
        .expect(200)
        .expect(function(res) {
          orderrowId = res.body.orderRowId;
        });
      }).then(function() {
        devLogin('tanja@tilaa.ja', function(err, url) {
          loginUrl = url;
          done(err);
        });
      });
  });

  it('should show existing own orders', function() {
    return browser.url(loginUrl) // Should redirect orderer to own orders
      .waitForVisible('h1=Omat tilaukset')
      .waitForVisible('div=Kakkosnelonen')
      .waitForVisible('td=Hankin itse')
      .waitForVisible('span=2026')
      .getText('div=Kakkosnelonen').should.eventually.be.ok
      .getText('span=Tanjan tilaus').should.eventually.be.ok;
  });

  it('should show other\'s orders from owned costcenters', function() {
    return browser.url(loginUrl)
      .waitForVisible('h1=Omat tilaukset')
      .waitForVisible('div=Iso naula')
      .isVisible('span=Leirin tavarat - controller').should.eventually.equal(true);

  });

  afterEach(function() {
    return browser
      .click('=Kirjaudu ulos')
      .waitForVisible('.btn*=Kirjaudu sisään');
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseuser', userId),
      testUtils.deleteFixtureIfExists('Purchaseorder', orderId),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId)
    ).nodeify(done);
  });

  after(function(done) {
    this.timeout(20000);
    appRunner.resetDatabase(done);
  });

  after(appRunner.halt);
});
