var _ = require('lodash');
var React = require('react');
var connectToStores = require('alt/utils/connectToStores');
var ErrorDialog = require('./utils/ErrorDialog.jsx');
var Router = require('react-router');

var getErrorNotification = function(ErrorActions, ErrorStore) {
  var errorNotification = React.createClass({
    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ ErrorStore ]
      },

      getPropsFromStores() {
        return ErrorStore.getState()
      }
    },

    getDefaultProps: function() {
      return {
        errors: [ ]
      }
    },

    onHide: function() {
      ErrorActions.confirmError();
    },

    onConfirm: function() {
      ErrorActions.confirmError();
    },

    render: function() {
      var error = this.props.errors.length && this.props.errors[this.props.errors.length - 1];
      const dialog = error ? (<ErrorDialog title="Virhe!" onHide={ this.onHide } onConfirm={ this.onConfirm } error={error}></ErrorDialog>) : '';
      return (
        <div>{ dialog }</div>
      );
    }
  });

  return connectToStores(errorNotification);
};

module.exports = getErrorNotification;
