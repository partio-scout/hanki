var appRunner = require('./utils/app-runner');
var login = require('./utils/login');
var Promise = require('bluebird');
var app = require('../server/server');
var testUtils = require('../server/test/utils/test-utils');
var request = require('supertest');

describe('Arrived deliveries', function() {
  var loginUrl, userId, orderId, orderrowId, accessToken;
  var purchaseUser = app.models.Purchaseuser;
  var findCostcenter = Promise.promisify(app.models.Costcenter.find, app.models.Costcenter);
  var findRole = Promise.promisify(app.models.Role.find, app.models.Role);

  function addNewOrder(browser) {
    return browser.url(loginUrl)
      .waitForVisible('=Ulkoiset tilaukset')
      .click('=Ulkoiset tilaukset')
      .waitForVisible('.btn*=Uusi ulkoinen tilaus')
      .click('.btn*=Uusi ulkoinen tilaus')
      .waitForVisible('h4=Uusi ulkoinen tilaus')
      .setValue('input[label="* Toimittajan nimi"]', 'Minimani')
      .setValue('input[label="* Toimittajan Y-tunnus"]', '1234567')
      .click('.btn*=Tallenna');
  }

  function addRowToOrder(browser) {
    return addNewOrder(browser)
    .waitForVisible('span=Minimani')
    .click('span=Lisää tilausrivejä')
    .waitForVisible('span=Lisää rivejä tilaukseen')
    .click('tr:nth-child(1) .btn.row-inline.add-row')
    .click('.btn=Sulje');
  }

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
          'deliveryId': 2,
          'orderId': orderId,
          'approved': false,
          'finished': false,
          'modified': d,
        })
        .expect(200)
        .expect(function(res) {
          orderrowId = res.body.orderRowId;
        });
      }).nodeify(done);
  });

  beforeEach(function(done) {
    login('pekka.paallikko@roihu2016.fi', function(err, url) {
      loginUrl = url;
      done(err);
    });
  });

  it('should allow marking row partly delivered', function() {
    return addRowToOrder(browser)
    .waitForVisible('span.product-name=Kakkosnelonen')
    .waitForVisible('=Saapuvat tilaukset')
    .click('=Saapuvat tilaukset')
    .waitForVisible('p=Uusi saapuva tilaus')
    .selectByVisibleText('select[label="Ulkoinen tilaus "]', '00001 Minimani')
    .waitForVisible('th=Kakkosnelonen')
    .setValue('input[type="text"]', 100)
    .setValue('input[label="Saapumispäivä "]', '06/30/2016')
    .click('span=Tallenna')
    .waitForVisible('Kakkosnelonen', null, true)
    .selectByVisibleText('select[label="Ulkoinen tilaus "]', '00001 Minimani')
    .waitForVisible('span=100');
  });

  it('should allow marking row as final delivery', function() {
    return addRowToOrder(browser)
    .waitForVisible('span.product-name=Kakkosnelonen')
    .waitForVisible('=Saapuvat tilaukset')
    .click('=Saapuvat tilaukset')
    .waitForVisible('p=Uusi saapuva tilaus')
    .selectByVisibleText('select[label="Ulkoinen tilaus "]', '00002 Minimani')
    .waitForVisible('th=Kakkosnelonen')
    .click('input[type="checkbox"]')
    .setValue('input[type="text"]', 0)
    .setValue('input[label="Saapumispäivä "]', '06/30/2016')
    .click('span=Tallenna')
    .waitForVisible('Kakkosnelonen', null, true)
    .selectByVisibleText('select[label="Ulkoinen tilaus "]', '00002 Minimani')
    .waitForVisible('input[type="checkbox"]', null, true);
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
      testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId),
      testUtils.deleteFixturesIfExist('Externalorder')
    ).nodeify(done);
  });

  after(function(done) {
    this.timeout(20000);
    appRunner.resetDatabase(done);
  });

  after(appRunner.halt);
});
