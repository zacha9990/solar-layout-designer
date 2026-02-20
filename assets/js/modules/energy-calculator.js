/**
 * Energy Calculator Class
 */
class EnergyCalculator {
    constructor(energyPerPanel) {
        this.energyPerPanel = energyPerPanel; // kWh per panel per year
        this.electricityRate = 0.25; // EUR per kWh
    }
    
    /**
     * Calculate annual energy production
     */
    calculateAnnualEnergy(panelCount) {
        return panelCount * this.energyPerPanel;
    }
    
    /**
     * Calculate monthly average
     */
    calculateMonthlyAverage(annualEnergy) {
        return Math.round(annualEnergy / 12);
    }
    
    /**
     * Calculate annual savings
     */
    calculateAnnualSavings(annualEnergy) {
        return Math.round(annualEnergy * this.electricityRate);
    }
    
    /**
     * Update electricity rate
     */
    setElectricityRate(rate) {
        if (rate > 0) {
            this.electricityRate = rate;
            return true;
        }
        return false;
    }
    
    /**
     * Override energy per panel (e.g. from PVGIS live data)
     */
    setEnergyPerPanel(value) {
        if (value > 0) { this.energyPerPanel = value; return true; }
        return false;
    }

    /**
     * Get all calculations
     */
    calculate(panelCount) {
        const annualEnergy = this.calculateAnnualEnergy(panelCount);
        const monthlyAverage = this.calculateMonthlyAverage(annualEnergy);
        const annualSavings = this.calculateAnnualSavings(annualEnergy);
        
        return {
            panelCount,
            annualEnergy,
            monthlyAverage,
            annualSavings,
            electricityRate: this.electricityRate
        };
    }
    
    /**
     * Format number with thousands separator
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Make available globally
window.EnergyCalculator = EnergyCalculator;
