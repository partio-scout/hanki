var _ = require('lodash');

function getTitleActions(alt, Title, Titlegroup) {
  class TitleActions {
    updateTitles(titles) {
      this.dispatch(costCenters);
    }

    titleUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchTitles() {
      this.dispatch();
      Titlegroup.findAll((err, titlegroups) => {
        if (err) {
          this.actions.titleUpdateFailed(null);
        } else {
          Title.findAll((err, titles) => {
            if (err) {
              titleUpdateFailed(err);
              return;
            }

            var titlesByGroup = _(titlegroups)
              .map(function(group) {
                group.titles = {};
                return group;
              })
              .indexBy('titlegroupId')
              .value();

            // Put titles into groups
            _.each(titles, function(title) {
              titlesByGroup[title.titlegroupId].titles[title.titleId] = title;
            });
          });
        }
      });
    }
  }
  return alt.createActions(TitleActions);
}

module.exports = getTitleActions;
