var _ = require('lodash');

function getCostCenterActions(alt, CostCenter) {
  class CostCenterActions {
    updateCostCenters(costCenters) {
      this.dispatch(costCenters);
    }

    costCenterUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchCostCenters() {
      this.dispatch();
      CostCenter.findAll((err, costCenters) => {
        if (err) {
          this.actions.costCenterUpdateFailed(null);
        } else {
          this.actions.updateCostCenters(_.indexBy(costCenters, 'costcenterId'));
        }
      });
    }
  }
  return alt.createActions(CostCenterActions);
}

module.exports = getCostCenterActions;
