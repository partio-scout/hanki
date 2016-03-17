var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');

describe('dev-login', function() {
  var loginUrl;

  it('should log a user in', function() {
    return browser.url(loginUrl)
      .waitForVisible('h1=Omat tilaukset')
      .getText('h1=Omat tilaukset').should.eventually.be.ok
      .click('=Kirjaudu ulos');
  });

  before(function(done) {
    appRunner.run(done);
  });

  after(function() {
    appRunner.halt();
  });

  beforeEach(function(done) {
    devLogin('teuvo@tilaa.ja', function(err, url) {
      loginUrl = url;
      done(err);
    });
  });
});
