var Promise = require('bluebird');
var ttl = 8*3600;

module.exports = function(app) {
  var findAccessTokenById = Promise.promisify(app.models.AccessToken.findById, app.models.AccessToken);
  var findUserById = Promise.promisify(app.models.Purchaseuser.findById, app.models.Purchaseuser);

  app.get('/login/:id', function(req, res) {
    var id = req.params.id;
    getNewAccessTokenForToken(id)
      .then(function(accessToken) {
        console.log('Login using link as user #' + accessToken.userId);
        res.cookie('accessToken', JSON.stringify(accessToken));
        res.redirect('/');
      }, function(err) {
        console.log('Link login failed:', err);
        res.status(400).send('Kirjautumislinkki ei kelpaa');
      });
  });

  function getNewAccessTokenForToken(oldAccessTokenId) {
    return findAccessTokenById(oldAccessTokenId)
      .then(validateAccessToken)
      .then(getUserIdFromAccessToken)
      .then(findUserById)
      .then(createAccessTokenForUser);
  }

  function validateAccessToken(accessToken) {
    if (!accessToken) {
      throw new Error('accessToken not found');
    }
    var validate = Promise.promisify(accessToken.validate, accessToken);
    return validate().then(function(isValid) {
      if (isValid) {
        return accessToken;
      } else {
        throw new Error('accessToken is not valid');
      }
    });
  }

  function getUserIdFromAccessToken(accessToken) {
    return accessToken.userId || -1;
  }

  function createAccessTokenForUser(user) {
    var createToken = Promise.promisify(user.createAccessToken, user);
    return createToken(ttl);
  }
};
