var appRunner = require('./utils/app-runner');

describe('HANKI', function() {

  it('should contain a login button', function() {

    var loginButton = browser
      .url('/')
      .selectByVisibleText('.btn', 'Kirjaudu');
    return expect(loginButton).to.be.ok;
  });

  // According to Mochas hook syntax, be
  before(function(done) {
    appRunner.run(done);
  });

  after(function(done) {
    appRunner.halt(done);
  });
});
