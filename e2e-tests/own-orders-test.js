var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');
var Promise = require('bluebird');
var app = require('../server/server');

describe('Own orders', function() {
  var loginUrl;
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
      .waitForVisible('div=Iso naula')
      .waitForVisible('td=Hankin itse')
      .getText('div=Iso naula').should.eventually.be.ok
      .getText('h2=Tanssilava - orderer').should.eventually.be.ok;
  });

  it('should show other\'s orders from owned costcenter', function() {
    return browser.url(loginUrl)
      .waitForVisible('div=Iso naula')
      .isVisible('h2=Leirin tavarat - controller').should.eventually.be.ok;
  });

  afterEach(function() {
    return browser
      .click('=Kirjaudu ulos')
      .waitForVisible('.btn*=Kirjaudu sisään');
  });

  after(function(done) {
    this.timeout(20000);
    appRunner.resetDatabase(done);
  });

  after(appRunner.halt);
});
