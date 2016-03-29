var webdriverio = require('webdriverio');

var options = {
  desiredCapabilities: {
    browserName: 'firefox',
  },
};

var url = process.argv[2];

console.log('Validating deployment at', url);

webdriverio
  .remote(options)
  .init()
  .url(url)
  .saveScreenshot('screenshot.png')
  .waitForVisible('.btn=Kirjaudu sisään Partio ID:llä')
  .end();
