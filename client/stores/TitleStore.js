var _ = require('lodash');

function getTitleStore(alt, TitleActions) {
  class TitleStore {
    constructor() {
      this.titles = { };
      this.titleGroups = { };

      this.bindListeners({
        handleUpdateTitles: TitleActions.UPDATE_TITLES,
        handleUpdateTitlegroups: TitleActions.UPDATE_TITLEGROUPS,
        handleTitleDeleted: TitleActions.TITLE_DELETED,
      });
    }

    handleUpdateTitles(titles) {
      this.titles = titles;
    }

    handleUpdateTitlegroups(titleGroups) {
      this.titleGroups = titleGroups;
    }

    handleTitleDeleted(deletedTitle) {
      let newTitles = _.filter(this.titles, title => title.titleId != deletedTitle.titleId);
      this.titles = newTitles;
    }
  }

  return alt.createStore(TitleStore, 'TitleStore');
}

module.exports = getTitleStore;
