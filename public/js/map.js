/**
 * MIRA NAMKEENS - LIVE LEAFLET GEO MAPS & DRIVER TRACKING
 * Zero-API key required, high precision OpenStreetMap Leaflet integration
 */

let addressPickerMap = null;
let addressMarker = null;
let liveTrackingMap = null;
let trackingInterval = null;
let leafletLoadPromise = null;

/**
 * Leaflet (~150KB) is only needed on the checkout address picker and the
 * live order tracking view, so it's loaded on demand instead of blocking
 * every page's initial parse.
 */
function ensureLeaflet(callback) {
  if (typeof L !== 'undefined') { callback(); return; }
  if (!leafletLoadPromise) {
    leafletLoadPromise = new Promise((resolve, reject) => {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  leafletLoadPromise.then(callback).catch(() => {
    if (typeof showToast === 'function') showToast('Map failed to load — please retry', 'error');
  });
}

/**
 * 1. ADDRESS PICKER MAP INITIALIZATION
 */
function initAddressPickerMap(defaultLat = 19.0760, defaultLng = 72.8777) {
  const mapContainer = document.getElementById('checkout-map-picker');
  if (!mapContainer) return;
  if (typeof L === 'undefined') { ensureLeaflet(() => initAddressPickerMap(defaultLat, defaultLng)); return; }

  // Destroy previous instance if any
  if (addressPickerMap) {
    addressPickerMap.remove();
    addressPickerMap = null;
  }

  addressPickerMap = L.map('checkout-map-picker').setView([defaultLat, defaultLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(addressPickerMap);

  // Custom Delivery Pin
  const pinIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background:#D97706; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); border:2px solid white;"></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34]
  });

  addressMarker = L.marker([defaultLat, defaultLng], { draggable: true, icon: pinIcon }).addTo(addressPickerMap);

  addressMarker.on('dragend', function (e) {
    const coord = e.target.getLatLng();
    updateCheckoutCoordinates(coord.lat, coord.lng);
  });

  addressPickerMap.on('click', function (e) {
    addressMarker.setLatLng(e.latlng);
    updateCheckoutCoordinates(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => {
    addressPickerMap.invalidateSize();
  }, 250);
}

function detectUserGPSLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser', 'error');
    return;
  }

  showToast('Detecting your GPS location...', 'info');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (addressPickerMap && addressMarker) {
        addressPickerMap.setView([latitude, longitude], 15);
        addressMarker.setLatLng([latitude, longitude]);
        updateCheckoutCoordinates(latitude, longitude);
        showToast('GPS Location pinned successfully!', 'success');
      }
    },
    (error) => {
      // Fallback to demo Mumbai coordinates
      showToast('GPS access denied or unavailable. Using default delivery zone.', 'info');
      if (addressPickerMap && addressMarker) {
        addressPickerMap.setView([19.0596, 72.8295], 14);
        addressMarker.setLatLng([19.0596, 72.8295]);
        updateCheckoutCoordinates(19.0596, 72.8295);
      }
    },
    { timeout: 8000 }
  );
}

function updateCheckoutCoordinates(lat, lng) {
  const coordDisplay = document.getElementById('checkout-geo-display');
  if (coordDisplay) {
    coordDisplay.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
}

/**
 * 2. LIVE ORDER TRACKING MAP WITH MOVING RIDER
 */
function initLiveOrderTrackingMap(order) {
  const container = document.getElementById('live-tracking-map-container');
  if (!container) return;
  if (typeof L === 'undefined') { ensureLeaflet(() => initLiveOrderTrackingMap(order)); return; }

  if (liveTrackingMap) {
    liveTrackingMap.remove();
    liveTrackingMap = null;
  }
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  const warehouse = MIRA_DATA.warehouseLocation;
  const destination = {
    lat: order.customer.lat || (warehouse.lat - 0.02),
    lng: order.customer.lng || (warehouse.lng - 0.03)
  };

  liveTrackingMap = L.map('live-tracking-map-container').setView([
    (warehouse.lat + destination.lat) / 2,
    (warehouse.lng + destination.lng) / 2
  ], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(liveTrackingMap);

  // Warehouse Marker
  const warehouseIcon = L.divIcon({
    html: `<div style="background:#78350F; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  L.marker([warehouse.lat, warehouse.lng], { icon: warehouseIcon })
    .bindPopup(`<b>${warehouse.name}</b><br/>Fresh Dispatch Origin`)
    .addTo(liveTrackingMap);

  // Customer Destination Marker
  const destIcon = L.divIcon({
    html: `<div style="background:#16A34A; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  L.marker([destination.lat, destination.lng], { icon: destIcon })
    .bindPopup(`<b>${order.customer.name}</b><br/>${order.customer.address}`)
    .addTo(liveTrackingMap);

  // Draw Route Polyline
  const routeLine = L.polyline([
    [warehouse.lat, warehouse.lng],
    [(warehouse.lat + destination.lat) / 2 + 0.005, (warehouse.lng + destination.lng) / 2 - 0.005],
    [destination.lat, destination.lng]
  ], { color: '#D97706', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(liveTrackingMap);

  liveTrackingMap.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  // Moving Driver Marker
  const driverIcon = L.divIcon({
    html: `<div class="pulse-badge" style="background:#2563EB; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 12px rgba(37,99,235,0.5);"></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });

  let step = 0;
  const totalSteps = 40;
  let currentLat = warehouse.lat;
  let currentLng = warehouse.lng;

  const driverMarker = L.marker([currentLat, currentLng], { icon: driverIcon }).addTo(liveTrackingMap);
  driverMarker.bindPopup(`<b>Driver: Suresh Patil</b><br/>Delivery Van En Route`).openPopup();

  // Animate Rider Movement
  trackingInterval = setInterval(() => {
    step = (step + 1) % totalSteps;
    const progress = step / totalSteps;
    
    currentLat = warehouse.lat + (destination.lat - warehouse.lat) * progress;
    currentLng = warehouse.lng + (destination.lng - warehouse.lng) * progress;

    driverMarker.setLatLng([currentLat, currentLng]);

    // Update ETA countdown
    const remainingMins = Math.max(1, Math.round(18 * (1 - progress)));
    const etaEl = document.getElementById('live-eta-countdown');
    if (etaEl) {
      etaEl.textContent = `${remainingMins} mins`;
    }
  }, 1200);

  setTimeout(() => {
    liveTrackingMap.invalidateSize();
  }, 300);
}
