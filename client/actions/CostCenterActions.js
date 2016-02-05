var _ = require('lodash');

function getCostCenterActions(alt, OwnCostCenter, CostCenter) {
  class CostCenterActions {
    updateCostCenters(costCenters) {
      this.dispatch(costCenters);
    }

    costCenterUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchOwnCostCenters() {
      this.dispatch();
      OwnCostCenter.findAll((err, costCenters) => {
        if (err) {
          this.actions.costCenterUpdateFailed(null);
        } else {
          this.actions.updateCostCenters(_.indexBy(costCenters, 'costcenterId'));
        }
      });
    }

    fetchAllCostCenters() {
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
