var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');
var Promise = require('bluebird');
var app = require('../server/server');
var testUtils = require('../server/test/utils/test-utils');
var request = require('supertest');

describe('External orders', function() {
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
    devLogin('pekka.paallikko@roihu2016.fi', function(err, url) {
      loginUrl = url;
      done(err);
    });
  });

  it('should allow adding external orders', function() {
    return addNewOrder(browser)
    .waitForVisible('span=Minimani');
  });

  it('should allow editing external orders', function() {
    return addNewOrder(browser)
    .waitForVisible('span=Minimani')
    .click('.edit')
    .waitForVisible('h4=Muokkaa ulkoista tilausta')
    .setValue('input[label="* Toimittajan nimi"]', 'Muokattu minimani')
    .click('.btn=Tallenna')
    .waitForVisible('span=Muokattu minimani');
  });

  it('should allow deleting external orders when it has no rows', function(){
    return addNewOrder(browser)
    .saveScreenshot('./ext-order.png')
    .waitForVisible('span=Minimani')
    .click('.delete')
    .waitForVisible('h4.modal-title=Poista ulkoinen tilaus')
    .click('.btn-primary=Kyllä')
    .waitForVisible('span=Minimani', null, true);
  });

  it('should allow external order to be marked as ordered', function(){
    return addNewOrder(browser)
    .waitForVisible('span=Minimani')
    .click('span=Merkitse tilatuksi')
    .waitForVisible('span=Tilattu');
  });

  it('should allow external order to be marked as not ordered', function(){
    return addNewOrder(browser)
    .waitForVisible('span=Minimani')
    .click('span=Merkitse tilatuksi')
    .waitForVisible('span=Tilattu')
    .click('span=Merkitse tilaamattomaksi')
    .waitForVisible('span=Merkitse tilatuksi');
  });

  it('should allow adding purchaseorderrows to external order', function() {
    return addRowToOrder(browser)
    .waitForVisible('span.product-name=Kakkosnelonen');
  });

  it('should not allow removing rows when order is marked as ordered', function() {
    return addRowToOrder(browser)
    .waitForVisible('span.product-name=Kakkosnelonen')
    .click('span=Merkitse tilatuksi')
    .waitForVisible('span=Tilattu')
    .waitForEnabled('.btn.row-inline.remove-row', null, true);
  });

  it('should not allow editing rows when order is marked as ordered', function() {
    return addRowToOrder(browser)
    .waitForVisible('span.product-name=Kakkosnelonen')
    .click('span=Merkitse tilatuksi')
    .waitForVisible('span=Tilattu')
    .waitForVisible('.edit-row')
    .getAttribute('.edit-row', 'disabled').should.eventually.be.ok;
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
