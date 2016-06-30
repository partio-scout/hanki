module.exports = function(app) {
  app.get('/login/:id', function(req, res) {
    var id = req.params.id;
    app.models.AccessToken.findById(id, function(err, accessToken) {
      if (err) {
        console.error('Cannot log in using link with id ' + id);
      } else {
        console.log('Login using link as user ' + accessToken.userId);
        res.cookie('accessToken', JSON.stringify(accessToken));
      }
      res.redirect('/');
    });
  });
};
