var fs = require('fs');
var SAML = require('passport-saml').SAML;

var useProductionPartioID = process.env.PARTIOID_USE_PRODUCTION === 'true';
var partioIDRemoteName = useProductionPartioID ? 'id' : 'qaid';
var conf = {
  path: '/auth/partioid',
  issuer: process.env.PARTIOID_SP_ISSUER || 'http://localhost:3000',
  entryPoint: 'https://' + partioIDRemoteName + '.partio.fi/simplesaml/saml2/idp/SSOService.php',
  cert: fs.readFileSync(__dirname + '/../../server/partioid-login/' + partioIDRemoteName + '.crt').toString(),
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

  app.post('/saml/consume', function(req, res) {
    partioid.validatePostResponse(req.body, function(err, samlResult) {
      if (err) {
        processError(req, res, err);
      } else {
        var query = {
          where: {
            memberNumber: samlResult.membernumber,
          },
        };
        app.models.Purchaseuser.findOne(query, function(err, user) {
          if (err) {
            res.send('Kirjautuminen epäonnistui tuntemattomasta syystä.');
            console.error(err);
          } else if (user === null) {
            res.send('PartioID:llä ei löytynyt käyttäjää - varmista, että käyttäjän jäsennumero on oikein.');
          } else {
            user.createAccessToken(3600, function(err, accessToken) {
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
