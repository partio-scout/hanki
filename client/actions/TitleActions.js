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
      console.log(Titlegroup, Title)
      Titlegroup.findAll((err, titlegroups) => {
        if (err) {
          this.actions.titleUpdateFailed(null);
        } else {
          Title.findAll((err, titles) => {
            var titlesByGroup = _(titlegroups)
              .map(function(group) {
                group.titles = {};
                return group;
              })
              .indexBy('titlegroupId')
              .value();
            //in a foreach, place title into correct group
            _.each(titles, function(title) {
              titlesByGroup[title.titlegroupId].titles[title.titleId] = title;
            });
            console.log(titlesByGroup)
          });
        }
      });
    }
  }
  return alt.createActions(TitleActions);
}

module.exports = getTitleActions;
