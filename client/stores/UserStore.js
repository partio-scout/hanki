var alt = require('../alt');
var UserActions = require('../actions/UserActions');

class UserStore {
  constructor() {
    // this.currentUser should be undefined when loading and null if the user isn't logged in
    this.currentUser = undefined;

    this.bindListeners({
      handleUpdateCurrentUser: UserActions.UPDATE_CURRENT_USER
    });
  }

  handleUpdateCurrentUser(currentUser) {
    this.currentUser = currentUser;
  }
}

module.exports = alt.createStore(UserStore, 'UserStore');
