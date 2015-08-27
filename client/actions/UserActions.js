function getUserActions(alt, User) {
  class UserActions {
    updateCurrentUser(currentUser) {
      this.dispatch(currentUser);
    }

    fetchCurrentUser(id) {
      this.dispatch();
      User.findById(id, this.actions.updateCurrentUser);
    }
  }
  return alt.createActions(UserActions);
}

module.exports = getUserActions;
