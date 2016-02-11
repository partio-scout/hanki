var _ = require('lodash');
var React = require('react');

var EmptyComponent = React.createClass({
  render: function() {
    return false;
  }
});

module.exports = function getRestrictRoles(UserStore) {
  return function restrictRoles(roles, Component, AlternativeComponent) {
    AlternativeComponent = AlternativeComponent || EmptyComponent;

    return React.createClass({
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
        if(this.state.currentUser && _.some(roles, role => this.state.currentUser.hasRole(role))) {
          return <Component {...this.props} />;
        } else {
          return <EmptyComponent />;
        }
      },
    });
  };
};
