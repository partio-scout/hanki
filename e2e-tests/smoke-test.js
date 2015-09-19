
// Function expression creating child process is saved to a variable
var spawn = require('child_process').spawn;

/*
The new process will get the same enviromental variables as the current
process, but the PORT is different.
*/
options = process.env;
console.log(options);
console.log(process.env.PATH);
options.PORT = 3005;

// New process is spawned with command "slc run".
var procSysProcess = spawn('slc',['run'],options).on('error', function( err ){ throw err });

describe('HANKI', function() {

  it('should contain a login button', function() {

    var loginButton = browser
            .url('http://localhost:3005/')
            .selectByVisibleText('.btn', 'Kirjaudu');
    return expect(loginButton).to.be.ok;
  });

  // According to Mochas hook syntax, be
  before(function(done) {
    /*
    An event listener is given for standard output stream of the chill process
    */
    procSysProcess.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
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
      console.log('Procurement system is closed');
      done();
    },1000);
  });
});
