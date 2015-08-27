var fs = require('fs');
var SAML = require('passport-saml').SAML;

//TODO Support production env too
var conf = {
  path: '/auth/partioid',
  issuer: process.env.PARTIOID_SP_ISSUER || 'http://localhost:3000',
  entryPoint: 'https://qaid.partio.fi/simplesaml/saml2/idp/SSOService.php',
  cert: fs.readFileSync('./server/partioid-login/qaid.crt').toString()
};
var partioid = new SAML(conf);

function processError(req, res, err) {
  res.status(500).send('Oho! Nyt tapahtui virhe. Jos tällaista tapahtuu uudelleen, ole yhteydessä digitaaliset.palvelut@roihu2016.fi. Sori! :(');
  console.error(err);
}

module.exports = function(app) {

  app.get('/saml/login', function(req, res) {
    partioid.getAuthorizeUrl(req, function(err, url) {
      if (err) {
        processError(req, res, err);
      } else {
        res.redirect(url);
      }
    });
  });

  app.post('/auth/partioid', function(req, res) {
    partioid.validatePostResponse(req.body, function(err, samlResult) {
      if (err) {
        processError(req, res, err);
      } else {
        app.models.User.findOne({ email: samlResult.email }, function(err, user) {
          if (err) {
            res.send('Kirjautuminen epäonnistui tuntemattomasta syystä.');
            console.error(err);
          } else if (user === null) {
            res.send('PartioID:llä ei löytynyt käyttäjää - varmista, että Kuksassa on sama sähköpostiosoite kuin Hankissa.');
          } else {
            user.createAccessToken(60, function(err, accessToken) {
              if (err) {
                processError(req, res, err);
              } else {
                res.cookie('accessToken', JSON.stringify(accessToken));
                res.cookie('email', user.email);
                res.redirect('/');
              }
            });
          }
        });
      }
    });
  });

};
