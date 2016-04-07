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
      }, 'filter={"include":{"relation":"order_rows","scope":{"fields":["orderRowId"]}}}');
    }

    deleteTitleFailed(err) {
      this.dispatch(err);
    }

    titleDeleted(title) {
      this.dispatch(title);
    }

    deleteTitle(title) {
      Title.del(title.titleId, (err) => {
        if (err) {
          this.actions.deleteTitleFailed(err);
        } else {
          this.actions.titleDeleted(title);
        }
      });
    }

    saveTitleFailed(err) {
      this.dispatch(err);
    }

    createTitle(title) {
      this.dispatch(title);
      Title.create(title, (err) => {
        if (err) {
          this.actions.saveTitleFailed(err);
        } else {
          this.actions.fetchTitles();
        }
      });
    }

    updateTitle(title) {
      this.dispatch(title);
      Title.update(title.titleId, title, (err) => {
        if (err) {
          this.actions.saveTitleFailed(err);
        } else {
          this.actions.fetchTitles();
        }
      });
    }
  }
  return alt.createActions(TitleActions);
}

module.exports = getTitleActions;
