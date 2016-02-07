var spawn = require('child_process').spawn;

/*
The new process will get the same enviromental variables as the current
process, but the PORT is different.
*/
var options = process.env;
options.PORT = 3005;

var procSysProcess;

function run(cb) {
  procSysProcess = spawn('node',['.'],options);

  procSysProcess.stdout.on('data', function (data) {
    var dataString = data.toString();
    // The keyword on output indecates procurement system is running
    if (dataString && dataString.indexOf('listening') !== -1){
      cb();
    }
  });
}

function halt(cb) {
  procSysProcess.kill();
  cb();
}

module.exports = {
  run: run,
  halt: halt,
};
