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
        this.rotation = 0; // Phase 2 implemented
        this.selected = false; // Phase 2 implemented
        this.lat = null; // geo-anchor: assigned after placement on map
        this.lng = null; // geo-anchor: assigned after placement on map
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
        const columns = Math.max(1, Math.floor(this.canvasWidth / (this.panelWidth + 20)));
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
     * Get total panel count
     */
    getPanelCount() {
        return this.panels.length;
    }
    
    /**
     * Duplicate a panel by ID, offset by 20px
     */
    duplicatePanel(id) {
        const original = this.panels.find(p => p.id === id);
        if (!original) return null;
        const newId = this.panelIdCounter++;
        const gap = 10;
        let newX = original.x + original.width + gap;
        let newY = original.y;
        // If it goes off the right edge, wrap to same y but clamp
        if (newX + original.width > this.canvasWidth) {
            newX = Math.max(0, this.canvasWidth - original.width);
        }
        newY = Math.min(newY, Math.max(0, this.canvasHeight - original.height));
        const panel = new SolarPanel(newId, newX, newY, original.width, original.height);
        panel.rotation = original.rotation;
        this.panels.push(panel);
        return panel;
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
