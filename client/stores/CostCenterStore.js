function getCostCenterStore(alt, CostCenterActions) {
  class CostCenterStore {
    constructor() {
      this.costCenters = [ ];

      this.bindListeners({
        handleUpdateCostCenters: CostCenterActions.UPDATE_COST_CENTERS
      });
    }

    handleUpdateCostCenters(costCenters) {
      this.costCenters = costCenters;
    }
  }

  return alt.createStore(CostCenterStore, 'CostCenterStore');
}

module.exports = getCostCenterStore;
