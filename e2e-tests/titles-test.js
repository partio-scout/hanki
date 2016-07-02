var appRunner = require('./utils/app-runner');
var login = require('./utils/login');

describe('Titles', function() {
  var loginUrl;

  function createTitle(browser, name, price) {
    return openNewTitleModal(browser)
      .setValue('input[label=Nimi]', name)
      .selectByVisibleText('select[label=Tuoteryhmä]', 'Puutavara')
      .setValue('input[label=Yksikkö]', 'kpl')
      .selectByVisibleText('select[label=ALV-prosentti]', '24%')
      .setValue('input[label="Hinta (sis. alv)"]', price)
      .setValue('[label=Kommentti]', 'Testikommentti vain :)')
      .click('button=Tallenna');
  }

  function openNewTitleModal(browser) {
    return browser.url(loginUrl)
      .waitForVisible('=Tuotteet')
      .click('=Tuotteet')
      .getText('h1=Tuotteet').should.eventually.be.ok
      .waitForVisible('*=Uusi tuote')
      .click('*=Uusi tuote')
      .waitForVisible('h4=Uusi tuote');
  }

  before(appRunner.run);

  beforeEach(function(done) {
    login('pekka.paallikko@roihu2016.fi', function(err, url) {
      loginUrl = url;
      done(err);
    });
  });

  it('should be validated before saving', function() {
    return openNewTitleModal(browser)
      .click('button=Tallenna')
      .waitForVisible('.alert-danger')
      .waitForVisible('li=Syötä nimi')
      .waitForVisible('li=Valitse tuoteryhmä')
      .waitForVisible('li=Syötä yksikkö')
      .waitForVisible('li=Valitse ALV-prosentti')
      .waitForVisible('li=Syötä hinta, joka on vähintään 0 €')
      .click('button=Peruuta');
  });

  it('should be possible to add', function() {
    return createTitle(browser, 'Testituote', '100')
      .waitForVisible('span=Testituote');
  });

  it('should be possible to edit', function() {
    return createTitle(browser, 'Muokattava tuote', '15') //TODO Use price with comma
      .waitForVisible('span=Muokattava tuote')
      // Newly-created item should be first in the list
      .click('.edit')
      .waitForVisible('h4=Muokkaa tuotetta')
      .getValue('input[label=Nimi]').should.eventually.equal('Muokattava tuote')
      .setValue('input[label=Nimi]', 'Uusi nimi')
      .click('button=Tallenna')
      .waitForVisible('span=Uusi nimi');
  });

  it('should be possible to delete', function() {
    return createTitle(browser, 'Poistettava tuote', '55')
      .waitForVisible('span=Poistettava tuote')
      .click('.delete')
      .waitForVisible('h4=Poista tuote')
      .click('button=Kyllä')
      .waitForExist('span=Poistettava tuote', 10000, true);
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
