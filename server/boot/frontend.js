var loopback = require('loopback');
var path = require('path');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true
});

module.exports = function(server) {

  var publicPath = path.resolve(__dirname, '../../public');
  server.use(loopback.static(publicPath));

  var isProduction = process.env.NODE_ENV === 'production';
  var isTest = process.env.NODE_ENV === 'test';

  if (!isProduction && !isTest) {
    var bundle = require('../frontend/bundle.js');
    bundle();
    server.all('/build/*', function (req, res) {
      proxy.web(req, res, {
        target: 'http://127.0.0.1:3001'
      });
    });
    server.all('/socket.io*', function (req, res) {
      proxy.web(req, res, {
        target: 'http://127.0.0.1:3001'
      });
    });

    proxy.on('error', function(e) {
      // Just catch it
    });
  }
};
