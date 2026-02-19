/**
 * Map Manager Class
 * Handles Google Maps integration and satellite view
 */
class MapManager {
    constructor(mapElementId, canvasWidth, canvasHeight) {
        this.mapElement = document.getElementById(mapElementId);
        this.map = null;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.isMapEnabled = false;
        this.currentLocation = null;
    }
    
    /**
     * Initialize Google Map with satellite view
     */
    initMap(lat, lng, zoom = 20) {
        if (!this.mapElement || typeof google === 'undefined') {
            console.warn('Google Maps not available');
            return false;
        }
        
        const center = {
            lat: lat || -6.200000,  // Default: Jakarta
            lng: lng || 106.816666
        };
        
        this.map = new google.maps.Map(this.mapElement, {
            center: center,
            zoom: zoom,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: ['satellite', 'hybrid']
            },
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            gestureHandling: 'greedy',
            tilt: 0 // Disable tilt for better rooftop view
        });
        
        this.currentLocation = center;
        this.isMapEnabled = true;
        
        return true;
    }
    
    /**
     * Search for address using Google Places Autocomplete
     */
    setupAddressSearch(inputElement, searchButton) {
        if (!inputElement || typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.warn('Solar Designer: Google Maps Places library not available, address search disabled.');
            return;
        }

        // Create autocomplete
        const autocomplete = new google.maps.places.Autocomplete(inputElement, {
            types: ['address']
        });
        
        // Bind to map bounds
        if (this.map) {
            autocomplete.bindTo('bounds', this.map);
        }
        
        // Handle place selection
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
                console.error('No geometry found for this place');
                return;
            }
            
            this.moveToLocation(
                place.geometry.location.lat(),
                place.geometry.location.lng(),
                20
            );
            
            // Update location display
            this.updateLocationDisplay(place.formatted_address);
        });
        
        // Handle search button click
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const address = inputElement.value;
                if (address) {
                    this.geocodeAddress(address);
                }
            });
            
            // Also handle Enter key
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const address = inputElement.value;
                    if (address) {
                        this.geocodeAddress(address);
                    }
                }
            });
        }
    }
    
    /**
     * Geocode address to coordinates
     */
    geocodeAddress(address) {
        if (typeof google === 'undefined') return;
        
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                this.moveToLocation(
                    location.lat(),
                    location.lng(),
                    20
                );
                this.updateLocationDisplay(results[0].formatted_address);
            } else {
                alert('Geocode was not successful: ' + status);
            }
        });
    }
    
    /**
     * Move map to specific location
     */
    moveToLocation(lat, lng, zoom) {
        if (!this.map) return;
        
        const location = new google.maps.LatLng(lat, lng);
        this.map.setCenter(location);
        this.map.setZoom(zoom);
        this.currentLocation = { lat, lng };
    }
    
    /**
     * Toggle map visibility
     */
    toggleMap(show) {
        if (!this.mapElement) return;
        
        this.mapElement.style.display = show ? 'block' : 'none';
        this.isMapEnabled = show;
    }
    
    /**
     * Update location display text
     */
    updateLocationDisplay(address) {
        const locationElement = document.getElementById('sld-current-location');
        if (locationElement) {
            locationElement.textContent = '📍 ' + address;
        }
    }
    
    /**
     * Get current center coordinates
     */
    getCenter() {
        if (!this.map) return this.currentLocation;
        
        const center = this.map.getCenter();
        return {
            lat: center.lat(),
            lng: center.lng()
        };
    }
    
    /**
     * Get map bounds (for area calculation later)
     */
    getBounds() {
        if (!this.map) return null;
        return this.map.getBounds();
    }
    
    /**
     * Resize map when canvas changes
     */
    resize() {
        if (this.map) {
            google.maps.event.trigger(this.map, 'resize');
        }
    }
    
    /**
     * Set map type
     */
    setMapType(type) {
        if (this.map) {
            this.map.setMapTypeId(type); // 'satellite' or 'hybrid'
        }
    }

    /**
     * Calculate meters per pixel at the current map center and zoom.
     * Formula: (156543.03392 × cos(lat × π/180)) / 2^zoom
     */
    getMetersPerPixel() {
        if (!this.map) return null;
        const lat  = this.map.getCenter().lat();
        const zoom = this.map.getZoom();
        return (156543.03392 * Math.cos(lat * Math.PI / 180)) / Math.pow(2, zoom);
    }
}

// Make available globally
window.MapManager = MapManager;
