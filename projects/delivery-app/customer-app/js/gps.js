// ============================================
// TechNomads - Driver App GPS
// ============================================

const GPS = {
    watchId: null,
    currentPosition: null,
    isTracking: false,
    updateInterval: null,

    // ============================================
    // GET LOCATION
    // ============================================
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    this.currentPosition = pos;
                    resolve(pos);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    // ============================================
    // START TRACKING
    // ============================================
    startTracking(callback) {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        if (this.watchId) {
            this.stopTracking();
        }

        this.isTracking = true;

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed || 0,
                    heading: position.coords.heading || 0,
                    timestamp: position.timestamp
                };

                this.currentPosition = pos;

                // Send to server
                this.sendLocation(pos);

                if (callback) callback(pos);
            },
            (error) => {
                console.error('GPS Error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000,
                distanceFilter: 10 // Update every 10 meters
            }
        );

        return this.watchId;
    },

    // ============================================
    // STOP TRACKING
    // ============================================
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isTracking = false;
        }

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    // ============================================
    // SEND LOCATION
    // ============================================
    async sendLocation(position) {
        try {
            await API.gps.updateLocation(position.lat, position.lng);
        } catch (error) {
            console.error('Failed to send location:', error);
        }
    },

    // ============================================
    // START ORDER TRACKING
    // ============================================
    startOrderTracking(orderId, callback) {
        this.startTracking(callback);

        // Send to server that tracking started
        API.gps.startTracking(orderId).catch(console.error);

        // Send location every 5 seconds
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            if (this.currentPosition) {
                try {
                    await this.sendLocation(this.currentPosition);
                } catch (error) {
                    console.error('Failed to send periodic location:', error);
                }
            }
        }, 5000);
    },

    // ============================================
    // STOP ORDER TRACKING
    // ============================================
    stopOrderTracking(orderId) {
        this.stopTracking();

        // Notify server
        API.gps.stopTracking(orderId).catch(console.error);
    },

    // ============================================
    // CALCULATE DISTANCE
    // ============================================
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRad(value) {
        return value * Math.PI / 180;
    },

    // ============================================
    // CHECK PERMISSIONS
    // ============================================
    async checkPermissions() {
        if (!navigator.permissions) {
            return 'unknown';
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state;
        } catch (error) {
            return 'unknown';
        }
    },

    // ============================================
    // REQUEST PERMISSIONS
    // ============================================
    async requestPermissions() {
        try {
            const pos = await this.getCurrentPosition();
            return { granted: true, position: pos };
        } catch (error) {
            return { granted: false, error: error.message };
        }
    }
};

// Export
window.GPS = GPS;