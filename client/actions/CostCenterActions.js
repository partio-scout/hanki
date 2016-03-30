var _ = require('lodash');

function getCostCenterActions(alt, OwnCostCenter, CostCenter) {
  class CostCenterActions {
    updateOwnCostCenters(costCenters) {
      this.dispatch(costCenters);
    }

    updateAllCostCenters(costCenters) {
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
          this.actions.updateOwnCostCenters(_.indexBy(costCenters, 'costcenterId'));
        }
      });
    }

    fetchAllCostCenters() {
      this.dispatch();
      CostCenter.findAll((err, costCenters) => {
        if (err) {
          this.actions.costCenterUpdateFailed(null);
        } else {
          this.actions.updateAllCostCenters(_.indexBy(costCenters, 'costcenterId'));
        }
      });
    }
  }
  return alt.createActions(CostCenterActions);
}

module.exports = getCostCenterActions;
