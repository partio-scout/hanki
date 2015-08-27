function getUserActions(alt, User) {
  class UserActions {
    updateCurrentUser(currentUser) {
      this.dispatch(currentUser);
    }

    fetchCurrentUser(id) {
      this.dispatch();
      User.findById(id, (err, user) => {
        if(err) {
          this.actions.updateCurrentUser(null);
        } else {
          this.actions.updateCurrentUser(user);
        }
      });
    }
  }
  return alt.createActions(UserActions);
}

module.exports = getUserActions;
