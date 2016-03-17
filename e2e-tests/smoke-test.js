var appRunner = require('./utils/app-runner');

describe('HANKI', function() {

  it('should contain a login button', function() {
    return browser
      .url('/')
      .getText('.btn=Kirjaudu sisään Partio ID:llä')
      .should.eventually.be.ok;
  });

  // According to Mochas hook syntax, be
  before(function(done) {
    appRunner.run(done);
  });

  after(function() {
    appRunner.halt();
  });
});
