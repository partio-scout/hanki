var fs = require('fs');
var SAML = require('passport-saml').SAML;

//TODO Support different envs
var partioid = new SAML({
  path: '/auth/partioid',
  issuer: 'http://localhost:3000',
  entryPoint: 'https://qaid.partio.fi/simplesaml/saml2/idp/SSOService.php',
  cert: fs.readFileSync('./server/partioid-login/qaid.crt').toString()
});

module.exports = function(app) {

  app.get('/saml/login', function(req, res) {
    partioid.getAuthorizeUrl(req, function(err, url) {
      //TODO Handle error
      res.redirect(url);
    });
  });

  app.post('/auth/partioid', function(req, res) {
    partioid.validatePostResponse(req.body, function(err, samlResult) {
      app.models.User.findOne({ email: samlResult.email }, function(err, user) {
        if(err) {
          res.send('Kirjautuminen epäonnistui tuntemattomasta syystä.')
          console.error(err);
        } else if(user === null) {
          res.send('PartioID:llä ei löytynyt käyttäjää - varmista, että Kuksassa on sama sähköpostiosoite kuin Hankissa.')
        } else {
          user.createAccessToken(60, function(err, accessToken) {
            res.cookie('accessToken', accessToken);
            res.cookie('email', user.email);
            res.redirect('/');
          });
        }
      });
      /*
        TODO:
        - handle errors
        - get user by email -> token to cookie
          - handle user not found error
      */
    });
  });

};
