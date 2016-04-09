var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');

describe('Own orders', function() {
  var loginUrl;

  before(appRunner.run);

  beforeEach(function(done) {
    devLogin('teuvo@tilaa.ja', function(err, url) {
      loginUrl = url;
      done(err);
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

  it('should not show other\'s orders', function() {
    return browser.url(loginUrl)
      .waitForVisible('div=Iso naula')
      .isVisible('h2=Leirin tavarat - controller').should.eventually.equal(false);
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
