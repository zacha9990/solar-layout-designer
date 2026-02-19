/**
 * Solar Panel Class
 */
class SolarPanel {
    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = 0; // For Phase 2
        this.selected = false; // For Phase 2
    }
    
    /**
     * Check if point is inside panel
     */
    contains(x, y) {
        return x >= this.x && 
               x <= this.x + this.width && 
               y >= this.y && 
               y <= this.y + this.height;
    }
    
    /**
     * Get center point
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

/**
 * Panel Manager Class
 */
class PanelManager {
    constructor(canvasWidth, canvasHeight, panelWidth, panelHeight) {
        this.panels = [];
        this.panelIdCounter = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.panelWidth = panelWidth;
        this.panelHeight = panelHeight;
    }
    
    /**
     * Add new panel at center or grid position
     */
    addPanel() {
        const id = this.panelIdCounter++;
        
        // Calculate grid position
        const columns = Math.floor(this.canvasWidth / (this.panelWidth + 20));
        const row = Math.floor(this.panels.length / columns);
        const col = this.panels.length % columns;
        
        const x = col * (this.panelWidth + 20) + 50;
        const y = row * (this.panelHeight + 20) + 50;
        
        const panel = new SolarPanel(id, x, y, this.panelWidth, this.panelHeight);
        this.panels.push(panel);
        
        return panel;
    }
    
    /**
     * Delete panel by ID
     */
    deletePanel(id) {
        const index = this.panels.findIndex(p => p.id === id);
        if (index !== -1) {
            this.panels.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Find panel at given coordinates
     */
    getPanelAt(x, y) {
        // Check from top to bottom (last drawn = on top)
        for (let i = this.panels.length - 1; i >= 0; i--) {
            if (this.panels[i].contains(x, y)) {
                return this.panels[i];
            }
        }
        return null;
    }
    
    /**
     * Update panel position
     */
    updatePanelPosition(panel, x, y) {
        // Constrain within canvas
        panel.x = Math.max(0, Math.min(x, this.canvasWidth - panel.width));
        panel.y = Math.max(0, Math.min(y, this.canvasHeight - panel.height));
    }
    
    /**
     * Get total panel count
     */
    getPanelCount() {
        return this.panels.length;
    }
    
    /**
     * Reset all panels
     */
    reset() {
        this.panels = [];
        this.panelIdCounter = 0;
    }

    /**
     * Update all existing panels to a new pixel size.
     * Called when map zoom changes.
     */
    resizePanels(newWidth, newHeight) {
        this.panelWidth  = newWidth;
        this.panelHeight = newHeight;
        this.panels.forEach(p => {
            p.width  = newWidth;
            p.height = newHeight;
        });
    }
}

// Make available globally
window.SolarPanel = SolarPanel;
window.PanelManager = PanelManager;
