// Load navigation first
fetch("static/nav.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("nav-placeholder").innerHTML = data;
        
        // Call function after the nav is inserted
        adjustContainerMargin();
    })
    .catch(error => console.error("Error loading the navigation:", error));

// function adjustContainerMargin() {
//     // Delay execution to ensure rendering
//     setTimeout(() => {
//         const navbar = document.querySelector("#nav-placeholder");
//         const container = document.querySelector(".container");

//         if (navbar && container) {
//             const navHeight = navbar.offsetHeight;
//             console.log("Navbar Height:", navHeight); // Debugging step
//             container.style.marginTop = navHeight + "px";
//         } else {
//             console.error("Navbar or container not found!");
//         }
//     }, 100); // Small delay to ensure navbar is rendered
// }

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('med');
    const searchBtn = document.getElementById('search-btn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    // Search when button is clicked
    searchBtn.addEventListener('click', performSearch);
    
    // Or when Enter key is pressed
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            resultsDiv.innerHTML = '<p class="error-message">Please enter a medicine name to search</p>';
            return;
        }
        
        // Show loading indicator
        loadingDiv.style.display = 'flex';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.justifyContent = 'center';
        loadingDiv.style.gap = '10px';
        resultsDiv.innerHTML = '';
        
        // Make API request to the Flask backend using GET with query parameters
        fetch(`/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.style.display = 'none';
            
            if (data.error) {
                resultsDiv.innerHTML = `<p class="error-message">${data.error}</p>`;
                return;
            }
            
            displayResults(data);
        })
        .catch(error => {
            loadingDiv.style.display = 'none';
            resultsDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        });
    }

    function displayResults(data) {
        resultsDiv.innerHTML = '';
        
        if (data.Error) {
            resultsDiv.innerHTML = `<p class="error-message">${data.Error}</p>`;
            return;
        }
        
        // Display each medicine
        for (const [medicineName, details] of Object.entries(data)) {
            const medicineCard = document.createElement('div');
            medicineCard.className = 'medicine-card';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'medicine-name';
            nameElement.textContent = medicineName;
            medicineCard.appendChild(nameElement);
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'medicine-details';
            
            // Define the display order (uses, side effects, substitutes, then everything else)
            const displayOrder = ['uses', 'side effects', 'substitutes'];
            
            // First add the properties in our preferred order
            displayOrder.forEach(propertyName => {
                for (const [property, value] of Object.entries(details)) {
                    if (property.toLowerCase() === propertyName) {
                        const propertyDiv = document.createElement('p');
                        
                        const propertyLabel = document.createElement('span');
                        propertyLabel.className = 'property-label';
                        propertyLabel.textContent = `${property}:`;
                        propertyDiv.appendChild(propertyLabel);
                        
                        const propertyValue = document.createElement('span');
                        propertyValue.className = 'property-value';
                        propertyValue.textContent = value;
                        propertyDiv.appendChild(propertyValue);
                        
                        detailsDiv.appendChild(propertyDiv);
                    }
                }
            });
            
            // Then add any remaining properties that weren't in our preferred order
            for (const [property, value] of Object.entries(details)) {
                if (!displayOrder.includes(property.toLowerCase())) {
                    const propertyDiv = document.createElement('p');
                    
                    const propertyLabel = document.createElement('span');
                    propertyLabel.className = 'property-label';
                    propertyLabel.textContent = `${property}:`;
                    propertyDiv.appendChild(propertyLabel);
                    
                    const propertyValue = document.createElement('span');
                    propertyValue.className = 'property-value';
                    propertyValue.textContent = value;
                    propertyDiv.appendChild(propertyValue);
                    
                    detailsDiv.appendChild(propertyDiv);
                }
            }
            
            medicineCard.appendChild(detailsDiv);
            resultsDiv.appendChild(medicineCard);
        }
    }
});