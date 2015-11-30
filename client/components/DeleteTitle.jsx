var React = require('react');
var Router = require('react-router');
var connectToStores = require('alt/utils/connectToStores');

var ConfirmDeleteDialog = require('./utils/ConfirmDeleteDialog');

module.exports = function getDeleteTitle(TitleActions, TitleStore) {
  return connectToStores(React.createClass({
    propTypes: {
      titles: React.PropTypes.object,
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ TitleStore ];
      },

      getPropsFromStores() {
        return {
          titles: TitleStore.getState().titles,
        };
      },
    },

    onHide: function() {
      this.transitionTo('title_list');
    },

    onConfirm: function() {
      var title = this.props.titles[this.props.params.titleId];
      TitleActions.deleteTitle(title);
      this.transitionTo('title_list');
    },

    render: function() {
      var title = this.props.titles[this.props.params.titleId] || { };
      return (
        <ConfirmDeleteDialog title="Poista tuote" onHide={ this.onHide } onConfirm={ this.onConfirm }>
          Haluatko varmasti poistaa tuotteen "{ title.name }"?
        </ConfirmDeleteDialog>
      );
    },
  }));
};
