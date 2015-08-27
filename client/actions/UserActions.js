var alt = require('../alt');

// TODO Move to main.jsx
var Cookie = require('js-cookie');
var accessToken = Cookie.getJSON('accessToken');

var request = require('superagent');
var RestfulResource = require('../utils/rest.js')(request);
var User = new RestfulResource('/api/User', accessToken);

class UserActions {
  updateCurrentUser(currentUser) {
    this.dispatch(currentUser);
  }

  fetchCurrentUser() {
    this.dispatch();
    User.findById(1, this.actions.updateCurrentUser);
  }
}

module.exports = alt.createActions(UserActions);
