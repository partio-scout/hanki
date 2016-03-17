var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');

var TitleForm = require('./TitleForm');

var validateTitle = require('../validation/title');

module.exports = function getNewTitle(TitleActions, TitleStore) {
  return React.createClass({

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    getInitialState: function() {
      return this.transformState(TitleStore.getState());
    },

    transformState: function (titleStoreState) {
      let state = { };
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

    getTitleFromState() {
      return {
        name: this.state.name,
        titlegroupId: this.state.titlegroupId,
        unit: this.state.unit,
        vatPercent: this.state.vatPercent,
        priceWithTax: this.state.priceWithTax,
        memo: this.state.memo,
        accountId: 0, // Default account
        supplierId: 0, // Default supplier
      };
    },

    onSave: function() {
      const title = this.getTitleFromState();

      const validationErrors = validateTitle(title);

      this.setState({ validationErrors });

      if (validationErrors.length === 0) {
        TitleActions.createTitle(title);
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
          formTitle="Uusi tuote"
          titleGroups={ this.state.titleGroups }
          validationErrors={ this.state.validationErrors }
          unitSelectionDisabled={ false }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks }
        />
      );
    },
  });
};

