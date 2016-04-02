var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');

describe('All orders', function() {
  var loginUrl;

  before(appRunner.run);

  beforeEach(function(done) {
    devLogin('pekka.paallikko@roihu2016.fi', function(err, url) {
      loginUrl = url;
      done(err);
    });
  });

  it('should show some initial orders', function() {
    return browser.url(loginUrl)
      .waitForVisible('=Tilaukset')
      .click('=Tilaukset')
      .waitForVisible('span=Iso naula')
      .getText('h1=Kaikki tilaukset').should.eventually.be.ok
      .getText('span=Iso naula').should.eventually.be.ok
      .getText('div=Leirin tavarat - controller').should.eventually.be.ok;
  });

  it('should allow editing order rows', function() {
    return browser.url(loginUrl)
      .waitForVisible('=Tilaukset')
      .click('=Tilaukset')
      .waitForVisible('span=Iso naula')
      .click('.btn.edit')
      .waitForVisible('h4=Muokkaa tuotetta')
      .setValue('input[label=Määrä]', 3)
      .selectByVisibleText('select[label=Toimitus]', 'Toimitus leirin alkuun mennessä')
      .click('button=Tallenna')
      .waitForVisible('h1=Kaikki tilaukset')
      .waitForVisible('span=Leirin alkuun')
      .getText('span=Leirin alkuun').should.eventually.be.ok;
  });

  it('should allow deleting order rows', function() {
    return browser.url(loginUrl)
      .waitForVisible('=Tilaukset')
      .click('=Tilaukset')
      .waitForVisible('span=Iso naula')
      .click('tr:nth-child(2) .btn.delete')
      .waitForVisible('h4=Poista tuote')
      .click('button=Kyllä')
      .waitForVisible('h1=Kaikki tilaukset')
      .waitForExist('div=Leirin tavarat - controller', 10000, true);
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
