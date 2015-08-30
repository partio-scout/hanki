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
      CostCenter.findAll((err, costCenter) => {
        if (err) {
          this.actions.costCenterUpdateFailed(null);
        } else {
          this.actions.updateCostCenters(costCenter);
        }
      });
    }
  }
  return alt.createActions(CostCenterActions);
}

module.exports = getCostCenterActions;
