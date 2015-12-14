function getUserActions(alt, User, deleteLocalAccessToken) {
  class UserActions {
    updateCurrentUser(currentUser) {
      this.dispatch(currentUser);
    }

    fetchCurrentUser(id) {
      this.dispatch();
      if (!id) {
        this.actions.updateCurrentUser(null);
      } else {
        User.findById(id, (err, user) => {
          if (err) {
            this.actions.updateCurrentUser(null);
          } else {
            User.raw('get', id + '/roles', (err, roles) => {
              if (err) {
                this.actions.updateCurrentUser(null);
              } else {
                user.hasRole = function(role) {
                  return roles.roles.indexOf(role) !== -1;
                };
                this.actions.updateCurrentUser(user);
              }
            });
          }
        });
      }
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
