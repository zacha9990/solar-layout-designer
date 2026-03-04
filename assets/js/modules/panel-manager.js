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
        const panel = new SolarPanel(
            newId,
            Math.min(original.x + 20, Math.max(0, this.canvasWidth  - original.width)),
            Math.min(original.y + 20, Math.max(0, this.canvasHeight - original.height)),
            original.width,
            original.height
        );
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
