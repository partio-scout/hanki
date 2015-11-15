module.exports = function mountLoopBackExplorer(server) {

  if (process.env.NODE_ENV !== 'dev') {
    return;
  }

  var explorer;
  try {
    explorer = require('loopback-component-explorer');
  } catch (err) {
    // Print the message only when the app was started via `server.listen()`.
    // Do not print any message when the project is used as a component.
    server.once('started', function(baseUrl) {
      console.log(
        'Run `npm install loopback-explorer` to enable the LoopBack explorer'
      );
    });
    return;
  }

  var restApiRoot = server.get('restApiRoot');

  var explorerApp = explorer.routes(server, { basePath: restApiRoot });
  server.use('/explorer', explorerApp);
  server.once('started', function() {
    var baseUrl = server.get('url').replace(/\/$/, '');
    console.log('Browse your REST API at %s/explorer', baseUrl);
  });
};
