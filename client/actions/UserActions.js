function getUserActions(alt, User, deleteLocalAccessToken) {
  class UserActions {
    updateCurrentUser(currentUser) {
      this.dispatch(currentUser);
    }

    fetchCurrentUser(id) {
      this.dispatch();
      User.findById(id, (err, user) => {
        if (err) {
          this.actions.updateCurrentUser(null);
        } else {
          this.actions.updateCurrentUser(user);
        }
      });
    }

    logoutCurrentUser() {
      this.dispatch();
      User.raw('POST', 'logout', () => {
        deleteLocalAccessToken();
        this.actions.updateCurrentUser(null);
      });
    }
  }
  return alt.createActions(UserActions);
}

module.exports = getUserActions;
