/* global browser, expect */

// Function expression creating child process is saved to a variable
var spawn = require('child_process').spawn;

/*
The new process will get the same enviromental variables as the current
process, but the PORT is different.
*/
var options = process.env;
options.PORT = 3005;

// A separate process is spawned for tests
var procSysProcess = spawn('node',['.'],options);

describe('HANKI', function() {

  it('should contain a login button', function() {

    var loginButton = browser
      .url('/')
      .selectByVisibleText('.btn', 'Kirjaudu');
    return expect(loginButton).to.be.ok;
  });

  // According to Mochas hook syntax, be
  before(function(done) {
    /*
    An event listener is given for standard output stream of the chill process
    */
    procSysProcess.stdout.on('data', function (data) {
      // Output is transformed into a string
      var dataString = data.toString();
      // The keyword on output indecates procurement system is running
      if (dataString && dataString.indexOf('listening') !== -1){
        done();
      }
    });
  });

  after(function(done) {
    /*
    A small delay is used before endind tests in order to show the end state
    of the system for a user
    */
    setTimeout(function() {
      procSysProcess.kill();
      done();
    },1000);
  });
});
