function getCostCenterStore(alt, CostCenterActions) {
  class CostCenterStore {
    constructor() {
      this.costCenters = [ ];

      this.bindListeners({
        handleUpdateOwnCostCenters: CostCenterActions.UPDATE_OWN_COST_CENTERS,
        handleUpdateAllCostCenters: CostCenterActions.UPDATE_ALL_COST_CENTERS,
      });
    }

    handleUpdateOwnCostCenters(costCenters) {
      this.ownCostCenters = costCenters;
    }

    handleUpdateAllCostCenters(costCenters) {
      this.allCostCenters = costCenters;
    }
  }

  return alt.createStore(CostCenterStore, 'CostCenterStore');
}

module.exports = getCostCenterStore;
