document.addEventListener('DOMContentLoaded', function() {
  fetch('/maps-script')
    .then(response => response.json())
    .then(data => {
      if (data.scriptUrl) {
        const mapsScript = document.createElement('script');
        mapsScript.src = data.scriptUrl;
        mapsScript.async = true;
        mapsScript.defer = true;
        document.head.appendChild(mapsScript);
      } else {
        console.error("Failed to load Google Maps script");
      }
    })
    .catch(error => console.error("Error loading Maps script URL:", error));
});

// Initialize the map and related functionality
function initMap() {
  const frameElement = document.getElementById('frame');
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map';
  mapContainer.style.height = '500px';
  mapContainer.style.width = '100%';
  mapContainer.style.borderRadius = '8px';
  mapContainer.style.border = '2px solid #4BA3DA';
  
  frameElement.parentNode.replaceChild(mapContainer, frameElement);
  
  // Default center (will be updated with user's location if permission granted)
  let center = { lat: 40.7128, lng: -74.0060 }; 
  
  // Create map instance
  const map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    fullscreenControl: true,
    streetViewControl: false,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_LEFT,
      mapTypeIds: [
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.SATELLITE,
        google.maps.MapTypeId.HYBRID,
        google.maps.MapTypeId.TERRAIN]
    }
  });
  function styleDropdown(dropdownElement) {
    dropdownElement.style.width = '250px'; // Adjust width to match search bar
  }
  // InfoWindow for displaying details
  const infoWindow = new google.maps.InfoWindow();
  
  // Direction service for routing
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#4BA3DA',
      strokeWeight: 5
    }
  });
  
  // Get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Update map center to user location
        map.setCenter(userLocation);
        
        // Add marker for user's location
        const userMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          },
          title: 'Your Location',
          zIndex: 999
        });
        
        // Add click event for user marker
        google.maps.event.addListener(userMarker, 'click', function() {
          infoWindow.setContent('<div><strong>Your Location</strong></div>');
          infoWindow.open(map, userMarker);
        });
        
        // Search for nearby healthcare facilities
        searchHealthcareFacilities(map, userLocation, infoWindow, directionsService, directionsRenderer, userMarker);
      },
      () => {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }
  
  // Add search box for finding specific facilities
  addSearchBox(map, directionsService, directionsRenderer);
  
  // Add filter controls
  addFilterControls(map);
}

// Function to search for nearby healthcare facilities
function searchHealthcareFacilities(map, location, infoWindow, directionsService, directionsRenderer, userMarker) {
  const service = new google.maps.places.PlacesService(map);
  
  // Healthcare facility types to search for
  const facilityTypes = [
    { type: 'hospital', label: 'Hospital', icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
    { type: 'doctor', label: 'Clinic', icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    { type: 'pharmacy', label: 'Pharmacy', icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }
  ];
  
  // Store all markers for filtering
  window.allMarkers = [];
  
  // Search for each type of facility
  facilityTypes.forEach(facility => {
    service.nearbySearch(
      {
        location: location,
        radius: 5000, // 5km radius
        type: facility.type
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map, infoWindow, facility.icon, facility.label, directionsService, directionsRenderer, userMarker);
          }
        }
      }
    );
  });
}

// Function to create markers for healthcare facilities
function createMarker(place, map, infoWindow, iconUrl, facilityType, directionsService, directionsRenderer, userMarker) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: iconUrl,
    title: place.name,
    facilityType: facilityType.toLowerCase()
  });
  
  // Store marker for filtering
  if (!window.allMarkers) window.allMarkers = [];
  window.allMarkers.push(marker);
  
  // Add click event to show info window and calculate route
  google.maps.event.addListener(marker, 'click', function() {
    // Get additional details about the place
    const service = new google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'rating', 'opening_hours', 'website']
      },
      (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Create content for info window
          let content = `
            <div style="max-width: 300px">
              <h3 style="margin-bottom: 5px">${placeDetails.name}</h3>
              <p style="color: #666; font-size: 13px; margin-top: 0">${facilityType}</p>
              <p>${placeDetails.formatted_address || 'Address not available'}</p>
          `;
          
          if (placeDetails.formatted_phone_number) {
            content += `<p>📞 ${placeDetails.formatted_phone_number}</p>`;
          }
          
          if (placeDetails.rating) {
            content += `<p>⭐ ${placeDetails.rating} / 5</p>`;
          }
          
          if (placeDetails.opening_hours && placeDetails.opening_hours.isOpen) {
            const isOpen = placeDetails.opening_hours.isOpen();
            content += `<p style="color: ${isOpen ? 'green' : 'red'}">${isOpen ? '✅ Open now' : '❌ Closed now'}</p>`;
          }
          
          if (placeDetails.website) {
            content += `<p><a href="${placeDetails.website}" target="_blank">Visit Website</a></p>`;
          }
          
          content += `
            <button onclick="calculateRoute('${place.place_id}')" style="background: #4BA3DA; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-top: 10px; cursor: pointer;">Get Directions</button>
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
          
          // Store selected place for route calculation
          window.selectedPlace = {
            placeId: place.place_id,
            position: place.geometry.location
          };
        }
      }
    );
  });
}

function calculateRoute(placeId) {
window.calculateRoute = function(placeId) {
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Get place details to get the name for a better navigation experience
        const service = new google.maps.places.PlacesService(window.map);
        service.getDetails(
          {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'geometry']
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Format: https://www.google.com/maps/dir/?api=1&origin=ORIGIN&destination=DESTINATION&destination_place_id=PLACE_ID
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent(place.name || place.formatted_address)}&destination_place_id=${placeId}&travelmode=driving`;
              
              // Option 1: Open in a new tab
              window.open(mapsUrl, '_blank');
              
            } else {
              // Fallback if we can't get place details
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination_place_id=${placeId}&travelmode=driving`;
              window.open(mapsUrl, '_blank');
            }
          }
        );
      },
      () => {
        // Fallback if we can't get user location
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}&travelmode=driving`;
        window.open(mapsUrl, '_blank');
        alert('Using your current location for directions. Please allow location access for a better experience.');
      }
    );
  } else {
    // Fallback for browsers that don't support geolocation
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  }
};
}
// Function to handle geolocation errors
function handleLocationError(browserHasGeolocation, pos) {
  const infoWindow = new google.maps.InfoWindow();
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? 'Error: The Geolocation service failed. Please allow location access to see healthcare facilities near you.'
      : 'Error: Your browser doesn\'t support geolocation.'
  );
  infoWindow.open(map);
}
function addSearchBox(map, directionsService, directionsRenderer) {
  // Create search box container
  const searchBoxContainer = document.createElement('div');
  searchBoxContainer.style.padding = '6px';
  searchBoxContainer.style.backgroundColor = 'white';
  searchBoxContainer.style.borderRadius = '8px';
  searchBoxContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  searchBoxContainer.style.margin = '6px';
  searchBoxContainer.style.width = '250px';  // Reduced from 300px
  searchBoxContainer.style.position = 'relative';
  
  // Create search 
// Function to add search box for finding specific facilities
const searchInput = document.createElement('input');
  searchInput.id = 'searchInput';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search for healthcare facilities...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '6px';  // Reduced from 8px
  searchInput.style.paddingRight = '25px';  // Reduced from 30px
  searchInput.style.border = '1px solid #ccc';
  searchInput.style.borderRadius = '4px';
  searchInput.style.fontSize = '12px';  // Reduced from 14px
  searchInput.style.boxSizing = 'border-box';
  
  // Create reset button (X)
  const resetButton = document.createElement('div');
  resetButton.id = 'resetSearchButton';
  resetButton.innerHTML = '✕'; // X symbol
  resetButton.style.position = 'absolute';
  resetButton.style.right = '15px';  // Reduced from 20px
  resetButton.style.top = '12px';  // Adjusted from 19px
  resetButton.style.cursor = 'pointer';
  resetButton.style.color = '#888';
  resetButton.style.fontSize = '14px';  // Reduced from 16px
  resetButton.style.display = 'none'; // Hide initially
  
  // Add reset button click event
  resetButton.addEventListener('click', function() {
    // Clear search input
    searchInput.value = '';
    
    // Hide reset button
    resetButton.style.display = 'none';
    
    // Clear search markers
    if (window.searchMarkers && window.searchMarkers.length > 0) {
      window.searchMarkers.forEach(function(marker) {
        marker.setMap(null);
      });
      window.searchMarkers = [];
    }
    
    // Reset directions renderer if active
    if (window.directionsRenderer) {
      window.directionsRenderer.setMap(null);
      window.directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4BA3DA',
          strokeWeight: 5
        }
      });
    }
    
    // Reset map to user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userLocation);
          map.setZoom(15);
        },
        () => {
          // If geolocation fails, use default center
          map.setCenter({ lat: 40.7128, lng: -74.0060 });
          map.setZoom(15);
        }
      );
    }
    
    // Remove any route info boxes
    const existingRouteInfo = document.getElementById('routeInfo');
    if (existingRouteInfo) {
      existingRouteInfo.remove();
    }
    
    // Hide directions panel if it exists
    const directionsPanel = document.getElementById('directionsPanel');
    if (directionsPanel) {
      directionsPanel.style.display = 'none';
    }
    
    // Show all markers based on current filter
    if (window.allMarkers) {
      const activeFilter = document.querySelector('.filter-container button[style*="background-color: rgb(75, 163, 218)"]');
      const filterType = activeFilter ? activeFilter.id.replace('filter-', '') : 'all';
      
      window.allMarkers.forEach(marker => {
        if (filterType === 'all' || marker.facilityType === filterType.toLowerCase()) {
          marker.setVisible(true);
        }
      });
    }
  });
  
  // Show/hide reset button based on input content
  searchInput.addEventListener('input', function() {
    resetButton.style.display = this.value ? 'block' : 'none';
  });
  
  // Add elements to container
  searchBoxContainer.appendChild(searchInput);
  searchBoxContainer.appendChild(resetButton);
  
  // Position the search box at the top center of the map
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBoxContainer);
  
  // Initialize the search box
  const searchBox = new google.maps.places.SearchBox(searchInput);
  
  // Bias the SearchBox results towards current map's viewport
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });
  
  // Create an array to store search markers
  window.searchMarkers = [];
  
  // Listen for the event fired when the user selects a prediction
  searchBox.addListener('places_changed', function() {
    const places = searchBox.getPlaces();
    
    if (places.length === 0) {
      return;
    }
    
    // Show reset button when places are found
    resetButton.style.display = 'block';
    
    // Clear previous markers
    window.searchMarkers.forEach(function(marker) {
      marker.setMap(null);
    });
    window.searchMarkers = [];
    
    // For each place, get the icon, name and location
    const bounds = new google.maps.LatLngBounds();
    
    places.forEach(function(place) {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }
      
      // Create a marker for the place
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      
      const marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });
      
      window.searchMarkers.push(marker);
      
      // Add click listener to the marker
      marker.addListener('click', function() {
        // Create info window content
        const content = `
          <div>
            <h3>${place.name}</h3>
            <p>${place.formatted_address || ''}</p>
            <button onclick="calculateRoute('${place.place_id}')" style="background: #4BA3DA; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-top: 10px; cursor: pointer;">Get Directions</button>
          </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
          content: content
        });
        
        infoWindow.open(map, marker);
      });
      
      if (place.geometry.viewport) {
        // Only geocodes have viewport
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    
    map.fitBounds(bounds);
  });
  
  // Store directionsRenderer globally for access from calculateRoute
  window.directionsRenderer = directionsRenderer;
  window.map = map;
}

// Function to add filter controls
function addFilterControls(map) {
  // Create filter container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  filterContainer.style.backgroundColor = 'white';
  filterContainer.style.padding = '10px';
  filterContainer.style.borderRadius = '8px';
  filterContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  filterContainer.style.margin = '10px';
  filterContainer.style.display = 'flex';
  filterContainer.style.gap = '10px';
  
  // Create filter buttons
  const facilityTypes = [
    { id: 'all', label: 'All' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'clinic', label: 'Clinics' },
    { id: 'pharmacy', label: 'Pharmacies' }
  ];
  
  facilityTypes.forEach(type => {
    const button = document.createElement('button');
    button.id = `filter-${type.id}`;
    button.textContent = type.label;
    button.style.padding = '4px 8px'; // Reduced from 8px 12px
    button.style.fontSize = '12px'; // Added font size
    button.style.margin = '0';
    button.style.backgroundColor = type.id === 'all' ? '#4BA3DA' : '#f0f0f0';
    button.style.color = type.id === 'all' ? 'white' : 'black';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Add click event
    button.addEventListener('click', function() {
      // Update button styles
      facilityTypes.forEach(t => {
        document.getElementById(`filter-${t.id}`).style.backgroundColor = t.id === type.id ? '#4BA3DA' : '#f0f0f0';
        document.getElementById(`filter-${t.id}`).style.color = t.id === type.id ? 'white' : 'black';
      });
      
      // Filter markers
      if (window.allMarkers) {
        window.allMarkers.forEach(marker => {
          if (type.id === 'all' || marker.facilityType === type.id.toLowerCase()) {
            marker.setVisible(true);
          } else {
            marker.setVisible(false);
          }
        });
      }
    });
    
    filterContainer.appendChild(button);
  });
  
  // Position the filter at the top right of the map
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterContainer);
}