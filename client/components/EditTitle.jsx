var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');

var TitleForm = require('./TitleForm');

var validateTitle = require('../validation/title');

module.exports = function getEditTitle(TitleActions, TitleStore) {
  return React.createClass({
    propTypes: {
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    getInitialState: function() {
      return this.transformState(TitleStore.getState());
    },

    transformState: function (titleStoreState) {
      const titles = titleStoreState.titles || { };
      let state = titles[this.props.params.titleId] || { };
      state.titleGroups = _.filter(titleStoreState.titleGroups, titlegroup => titlegroup.titlegroupId !== 0);
      state.validationErrors = [];
      return state;
    },

    componentDidMount: function() {
      TitleStore.listen(this.onTitleStoreChange);
    },

    componentWillUnmount: function() {
      TitleStore.unlisten(this.onTitleStoreChange);
    },

    onTitleStoreChange: function(state) {
      this.setState(this.transformState(state));
    },

    onCancel: function() {
      this.transitionTo('title_list');
    },

    unitSelectionDisabled() {
      return this.state.order_rows.length > 0;
    },

    getTitleFromState() {
      const title = {
        titleId: this.state.titleId,
        name: this.state.name,
        titlegroupId: this.state.titlegroupId,
        unit: this.state.unit,
        vatPercent: this.state.vatPercent,
        priceWithTax: this.state.priceWithTax,
        memo: this.state.memo,
        accountId: this.state.accountId,
        supplierId: this.state.supplierId,
      };

      return title;
    },

    onSave: function() {
      const newTitle = this.getTitleFromState();

      const validationErrors = validateTitle(newTitle);

      this.setState({ validationErrors });

      if (validationErrors.length === 0) {
        TitleActions.updateTitle(newTitle);
        this.transitionTo('title_list');
      }
    },

    render() {
      const valueLinks = {
        name: this.linkState('name'),
        titlegroupId: this.linkState('titlegroupId'),
        unit: this.linkState('unit'),
        vatPercent: this.linkState('vatPercent'),
        priceWithTax: this.linkState('priceWithTax'),
        memo: this.linkState('memo'),
      };
      return (
        <TitleForm
          formTitle="Muokkaa tuotetta"
          titleGroups={ this.state.titleGroups }
          validationErrors={ this.state.validationErrors }
          unitSelectionDisabled={ this.unitSelectionDisabled() }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks }
        />
      );
    },
  });
};
