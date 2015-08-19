module.exports = function(server) {
  var router = server.loopback.Router();
  router.get('/status', server.loopback.status());
  server.use(router);
};
