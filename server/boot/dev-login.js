module.exports = function(app) {

  var isDev = process.env.NODE_ENV === 'dev';

  if(isDev) {
    app.get('/dev-login/:id', function(req, res) {
      var id = req.params.id;
      app.models.AccessToken.findById(id, function(err, accessToken) {
        console.log('Dev-login with id ', id, err, accessToken);
        res.cookie('accessToken', JSON.stringify(accessToken));
        res.redirect('/');
      })
    });
  }

}
