function getUserActions(alt, User) {
  class UserActions {
    updateCurrentUser(currentUser) {
      this.dispatch(currentUser);
    }

    fetchCurrentUser() {
      this.dispatch();
      User.findById(1, this.actions.updateCurrentUser);
    }
  }
  return alt.createActions(UserActions);
}

module.exports = getUserActions;
