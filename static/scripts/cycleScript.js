function generateCalendars() {
    let lastPeriod = document.getElementById("lastPeriod").value;
    let cycleLength = parseInt(document.getElementById("cycleLength").value);
    let periodLength = parseInt(document.getElementById("periodLength").value);
    let monthsToShow = parseInt(document.getElementById("monthsToShow").value);

    if (!lastPeriod) {
        alert("Please enter the last period start date.");
        return;
    }
    
    // Save data
    saveData();

    document.getElementById("tipsContainer").style.display = "block"; // Show tips
    document.getElementById("statsContainer").style.display = "block"; // Show stats

    // Parse last period date properly
    let lastDate = new Date(lastPeriod + "T00:00:00"); // Fix date parsing
    let calendarContainer = document.getElementById("calendarContainer");
    calendarContainer.innerHTML = ""; 

    let today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today date to start of day
    
    // Fix calculation of days since last period
    let daysSinceLastPeriod = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    // Handle edge case of same day
    if (daysSinceLastPeriod < 0) daysSinceLastPeriod = 0;
    
    let currentCycleDay = (daysSinceLastPeriod % cycleLength) + 1;
    
    // Calculate next period and ovulation
    let daysUntilNextPeriod = cycleLength - currentCycleDay + 1;
    if (daysUntilNextPeriod <= 0) daysUntilNextPeriod += cycleLength;
    
    let ovulationDay = cycleLength - 14;
    let daysUntilOvulation = ovulationDay - currentCycleDay;
    if (daysUntilOvulation <= 0) daysUntilOvulation += cycleLength;
    
    // Set stats
    document.getElementById("nextPeriodValue").textContent = daysUntilNextPeriod;
    document.getElementById("ovulationValue").textContent = daysUntilOvulation;
    
    let phaseBox = document.getElementById("phaseBox");
    phaseBox.className = "stat-box"; // Reset classes
    
    // Determine current phase
    let phase = "follicular"; // Default phase
    
    if (currentCycleDay <= periodLength) {
        phase = "menstruation";
        document.getElementById("cyclePhaseValue").textContent = "Menstrual";
        phaseBox.classList.add("phase-menstrual");
    } else if (currentCycleDay >= ovulationDay - 3 && currentCycleDay <= ovulationDay + 3) {
        phase = "ovulation";
        document.getElementById("cyclePhaseValue").textContent = "Ovulation";
        phaseBox.classList.add("phase-ovulation");
    } else if (currentCycleDay > ovulationDay) {
        phase = "luteal";
        document.getElementById("cyclePhaseValue").textContent = "Luteal";
        phaseBox.classList.add("phase-luteal");
    } else {
        document.getElementById("cyclePhaseValue").textContent = "Follicular";
        phaseBox.classList.add("phase-follicular");
    }
    
    // NEW APPROACH: Instead of generating arrays of predicted dates,
    // we'll create a map of all dates with their cycle information
    
    // Create a map to store all cycle data by date string
    let cycleDayMap = new Map();
    
    // Calculate first period date that can affect our calendar range
    // Go back enough cycles to make sure we cover the entire calendar range
    let firstCycleStart = new Date(lastDate);
    firstCycleStart.setDate(firstCycleStart.getDate() - (cycleLength * monthsToShow)); // Go back enough to cover calendar
    
    // Loop through enough cycles to cover our calendar range
    let cycleStartDate = new Date(firstCycleStart);
    let endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + monthsToShow + 1); // Go forward enough months + buffer
    
    // Generate all cycle days
    while (cycleStartDate < endDate) {
        // For each day in the cycle
        for (let day = 1; day <= cycleLength; day++) {
            let currentDate = new Date(cycleStartDate);
            currentDate.setDate(currentDate.getDate() + day - 1);
            let dateString = currentDate.toDateString();
            
            let dayData = {
                cycleDay: day,
                isPeriod: day <= periodLength,
                isOvulation: day === ovulationDay,
                isFertile: day >= ovulationDay - 3 && day <= ovulationDay + 3 && day !== ovulationDay,
                isPast: currentDate < today
            };
            
            cycleDayMap.set(dateString, dayData);
        }
        
        // Move to next cycle
        cycleStartDate.setDate(cycleStartDate.getDate() + cycleLength);
    }
    
    // Generate calendars
    let currentDate = new Date();
    currentDate.setDate(1); // Start from the first day of current month
    
    for (let i = 0; i < monthsToShow; i++) {
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        
        let monthDiv = document.createElement("div");
        monthDiv.className = "calendar-month";
        
        // Month title
        let monthTitle = document.createElement("div");
        monthTitle.className = "month-title";
        monthTitle.textContent = new Date(year, month, 1).toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
        monthDiv.appendChild(monthTitle);
        
        // Weekday headers
        let calendar = document.createElement("div");
        calendar.className = "calendar";
        
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
            let dayElem = document.createElement("div");
            dayElem.className = "weekday";
            dayElem.textContent = day;
            calendar.appendChild(dayElem);
        });
        
        // Get first day of month and total days
        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before the first day of month
        for (let j = 0; j < firstDay; j++) {
            let emptyDay = document.createElement("div");
            calendar.appendChild(emptyDay);
        }
        
        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            let dayElem = document.createElement("div");
            dayElem.className = "day";
            dayElem.textContent = day;
            
            let currentDateCheck = new Date(year, month, day);
            let dateString = currentDateCheck.toDateString();
            
            // Check if this is today
            let isToday = dateString === today.toDateString();
            if (isToday) {
                dayElem.classList.add("today");
            }
            
            // Use our precomputed cycle day map to determine status
            if (cycleDayMap.has(dateString)) {
                let dayData = cycleDayMap.get(dateString);
                
                // Apply appropriate classes based on day data
                if (dayData.isPeriod) {
                    // Different styling for past vs predicted periods
                    if (dayData.isPast) {
                        dayElem.classList.add("menstruation");
                        dayElem.title = `Day ${dayData.cycleDay} of period`;
                    } else {
                        dayElem.classList.add("predicted-period");
                        dayElem.title = "Predicted period";
                    }
                } else if (dayData.isOvulation) {
                    dayElem.classList.add("ovulation-day");
                    dayElem.title = dayData.isPast ? "Ovulation day" : "Predicted ovulation";
                } else if (dayData.isFertile) {
                    dayElem.classList.add("ovulation");
                    dayElem.title = dayData.isPast ? "Fertile window" : "Predicted fertile window";
                } else if (!dayData.isPast) {
                    // Just a regular future cycle day
                    dayElem.title = `Predicted day ${dayData.cycleDay} of cycle`;
                } else {
                    // Regular past cycle day
                    dayElem.title = `Day ${dayData.cycleDay} of cycle`;
                }
            }
            
            calendar.appendChild(dayElem);
        }
        
        monthDiv.appendChild(calendar);
        calendarContainer.appendChild(monthDiv);
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Set tips based on phase
    let moodTips = {
        menstruation: "Take it easy! Gentle yoga and warm drinks can help with cramps. Self-care is essential during this time.",
        ovulation: "You're likely feeling energized and confident. A great time for workouts and social activities!",
        luteal: "Mood swings? Try meditation and deep breathing exercises. Focus on calming activities.",
        follicular: "Boost your productivity and creativity with brain-stimulating activities! Your energy is building."
    };

    let nutritionTips = {
        menstruation: "Eat iron-rich foods like spinach, lentils, and lean meats to replenish lost iron. Stay hydrated with herbal teas.",
        ovulation: "Focus on protein and omega-3s like salmon and nuts for sustained energy. Avoid excess alcohol.",
        luteal: "Craving sugar? Choose healthy options like dark chocolate and fruits. Increase calcium intake.",
        follicular: "Eat antioxidant-rich foods like berries, citrus fruits, and leafy greens to support hormonal balance!"
    };
    
    let exerciseTips = {
        menstruation: "Opt for gentle movement like walking, stretching, or restorative yoga. Listen to your body's needs.",
        ovulation: "This is a great time for higher intensity workouts and strength training. Your energy levels are naturally higher.",
        luteal: "Balance is key - incorporate moderate cardio with stress-relieving activities like swimming or cycling.",
        follicular: "Your energy is increasing - gradually build up workout intensity and focus on form and technique."
    };

    document.getElementById("moodTip").innerHTML = `<strong>🌿 Mood Tip:</strong> ${moodTips[phase]}`;
    document.getElementById("nutritionTip").innerHTML = `<strong>🥗 Nutrition Tip:</strong> ${nutritionTips[phase]}`;
    document.getElementById("exerciseTip").innerHTML = `<strong>🏃‍♀️ Exercise Tip:</strong> ${exerciseTips[phase]}`;
}

// Save data when generating calendars
function saveData() {
    let data = {
        lastPeriod: document.getElementById("lastPeriod").value,
        cycleLength: document.getElementById("cycleLength").value,
        periodLength: document.getElementById("periodLength").value
    };
    localStorage.setItem("periodTrackerData", JSON.stringify(data));
}

// Check if user has existing data and populate form
window.onload = function() {
    let savedPeriodData = localStorage.getItem("periodTrackerData");
    if (savedPeriodData) {
        let data = JSON.parse(savedPeriodData);
        document.getElementById("lastPeriod").value = data.lastPeriod;
        document.getElementById("cycleLength").value = data.cycleLength;
        document.getElementById("periodLength").value = data.periodLength;
        generateCalendars();
    }
};