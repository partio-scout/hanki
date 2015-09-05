var _ = require('lodash');

function getTitleActions(alt, Title, Titlegroup) {
  class TitleActions {
    updateTitles(titles) {
      this.dispatch(titles);
    }

    titleUpdateFailed(error) {
      this.dispatch(error);
    }

    updateTitlegroups(titlegroups) {
      this.dispatch(titlegroups);
    }

    titlegroupUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchTitles() {
      this.dispatch();
      Titlegroup.findAll((err, titlegroups) => {
        if (err) {
          this.actions.titlegroupUpdateFailed(null);
        } else {
          this.actions.updateTitlegroups(_.indexBy(titlegroups, 'titlegroupId'));
        }
      });

      Title.findAll((err, titles) => {
        if (err) {
          this.actions.titleUpdateFailed(null);
        } else {
          this.actions.updateTitles(_.indexBy(titles, 'titleId'));
        }
      });
    }
  }
  return alt.createActions(TitleActions);
}

module.exports = getTitleActions;
