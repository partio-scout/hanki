
function getErrorActions(alt) {
  class ErrorActions {
    confirmError() {
      this.dispatch();
    }
  }
  return alt.createActions(ErrorActions);
}

module.exports = getErrorActions;
