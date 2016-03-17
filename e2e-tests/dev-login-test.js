var appRunner = require('./utils/app-runner');
var devLogin = require('./utils/dev-login');

describe('dev-login', function() {
  var loginUrl;

  it('should log a user in', function() {
    var h1 = browser
      .url(loginUrl)
      .selectByVisibleText('h1', 'Omat tilaukset');
    return expect(h1).to.be.ok;
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
