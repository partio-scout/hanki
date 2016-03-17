var appRunner = require('./utils/app-runner');

describe('HANKI', function() {

  it('should contain a login button', function() {
    return browser
      .url('/')
      .getText('.btn=Kirjaudu sisään Partio ID:llä')
      .should.eventually.be.ok;
  });

  before(appRunner.run);
  after(appRunner.halt);
});
