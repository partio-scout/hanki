var _ = require('lodash');
var React = require('react');

module.exports = function getRestrictRoles(UserStore) {
  return function restrictRoles(roles, Component) {
    return React.createClass({
      statics: {
        willTransitionTo(transition) {
          const currentUser = UserStore.getState().currentUser;

          if (!currentUser || !_.some(roles, role => currentUser.hasRole(role))) {
            transition.redirect('home');
          }
        },
      },

      getInitialState() {
        return UserStore.getState();
      },

      componentDidMount() {
        UserStore.listen(this.onChange);
      },

      componentWillUnmount() {
        UserStore.unlisten(this.onChange);
      },

      onChange(state) {
        this.setState(state);
      },

      render() {
        return this.state.currentUser && _.some(roles, role => this.state.currentUser.hasRole(role)) && <Component {...this.props} />;
      },
    });
  };
};
