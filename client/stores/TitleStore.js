function getTitleStore(alt, TitleActions) {
  class TitleStore {
    constructor() {
      this.titles = { };
      this.titleGroups = { };

      this.bindListeners({
        handleUpdateTitles: TitleActions.UPDATE_TITLES,
        handleUpdateTitlegroups: TitleActions.UPDATE_TITLEGROUPS
      });
    }

    handleUpdateTitles(titles) {
      this.titles = titles;
    }

    handleUpdateTitlegroups(titleGroups) {
      this.titleGroups = titleGroups;
    }
  }

  return alt.createStore(TitleStore, 'TitleStore');
}

module.exports = getTitleStore;
