var loopback = require('loopback');
var path = require('path');

module.exports = function(server) {
  var isDev = process.env.NODE_ENV === 'dev';

  server.on('started', function() {
    if (isDev) {
      var httpProxy = require('http-proxy');
      var proxy = httpProxy.createProxyServer({
        changeOrigin: true,
        ws: true,
      });

      var bundle = require('../frontend/bundle');
      bundle();
      server.all('/build/*', function (req, res) {
        proxy.web(req, res, {
          target: 'http://127.0.0.1:3001',
        });
      });
      server.all('/socket.io*', function (req, res) {
        proxy.web(req, res, {
          target: 'http://127.0.0.1:3001',
        });
      });

      proxy.on('error', function(e) {
        // Just catch it
      });

      server.on('upgrade', function (req, socket, head) {
        proxy.ws(req, socket, head);
      });
    }

    // Public path must be defined after dev paths or else LoopBack will always
    // use the production version of bundle.js if it happens to exist
    var publicPath = path.resolve(__dirname, '../../public');
    server.use(loopback.static(publicPath));
  });
};
