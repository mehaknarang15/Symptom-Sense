console.log("script")
function toggleQuestions() {
    var checkbox = document.getElementById("weakness");
    var extraQuestions = document.getElementById("weaknessQuestions");

    if (checkbox.checked) {
        extraQuestions.style.display = "block";
    } else {
        extraQuestions.style.display = "none";
    }
}

function feverQuestions() {
    var highFever = document.getElementById("highfever");
    var mildFever = document.getElementById("mildfever");
    var Questions = document.getElementById("FeverQuestions");

    if (highFever.checked || mildFever.checked) {
        Questions.style.display = "block";
    } else {
        Questions.style.display = "none";
    }
}

function painQuestions() {
    var headacheCheckbox = document.getElementById("headache");
    var jointPainCheckbox = document.getElementById("jointPain");
    var stomachPainCheckbox = document.getElementById("stomachPain");
    var chestPainCheckbox = document.getElementById("chestPain");
    var backPainCheckbox = document.getElementById("backPain");
    
    document.getElementById("headacheQuestions").style.display = 
        headacheCheckbox.checked ? "block" : "none";
    document.getElementById("jointPainQuestions").style.display = 
        jointPainCheckbox.checked ? "block" : "none";
    document.getElementById("stomachPainQuestions").style.display = 
        stomachPainCheckbox.checked ? "block" : "none";
    document.getElementById("chestPainQuestions").style.display = 
        chestPainCheckbox.checked ? "block" : "none";
    document.getElementById("backPainQuestions").style.display = 
        backPainCheckbox.checked ? "block" : "none";
        
    // Check for neurological cluster trigger
    if (headacheCheckbox.checked) {
        document.getElementById("neurologicalCluster").style.display = "block";
    } else {
        document.getElementById("neurologicalCluster").style.display = "none";
    }
    
    // Check for cardiovascular cluster trigger
    if (chestPainCheckbox.checked) {
        document.getElementById("cardiovascularCluster").style.display = "block";
    } else {
        document.getElementById("cardiovascularCluster").style.display = "none";
    }
    
    // Check for musculoskeletal cluster trigger
    if (jointPainCheckbox.checked || backPainCheckbox.checked) {
        document.getElementById("musculoskeletalCluster").style.display = "block";
    } else {
        document.getElementById("musculoskeletalCluster").style.display = "none";
    }
}

function digestiveQuestions() {
    var upperGICheckbox = document.getElementById("upperGI");
    var lowerGICheckbox = document.getElementById("lowerGI");
    
    document.getElementById("upperGIQuestions").style.display = 
        upperGICheckbox.checked ? "block" : "none";
    document.getElementById("lowerGIQuestions").style.display = 
        lowerGICheckbox.checked ? "block" : "none";
}

function respiratoryQuestions() {
    var coughCheckbox = document.getElementById("cough");
    var nasalCheckbox = document.getElementById("nasal");
    var throatCheckbox = document.getElementById("throat");
    
    document.getElementById("coughQuestions").style.display = 
        coughCheckbox.checked ? "block" : "none";
    document.getElementById("nasalQuestions").style.display = 
        nasalCheckbox.checked ? "block" : "none";
    document.getElementById("throatQuestions").style.display = 
        throatCheckbox.checked ? "block" : "none";
}
function skinQuestions() {
    var rashCheckbox = document.getElementById("skinRash");
    var skinColorCheckbox = document.getElementById("skinColor");
    
    document.getElementById("rashQuestions").style.display = 
        rashCheckbox.checked ? "block" : "none";
    document.getElementById("skinColorQuestions").style.display = 
        skinColorCheckbox.checked ? "block" : "none";
        
    // Check for dermatological cluster trigger
    if (rashCheckbox.checked || skinColorCheckbox.checked) {
        document.getElementById("dermatologicalCluster").style.display = "block";
    } else {
        document.getElementById("dermatologicalCluster").style.display = "none";
    }
    
    // Check for liver/jaundice cluster trigger
    if (skinColorCheckbox.checked) {
        document.getElementById("liverJaundiceCluster").style.display = "block";
    } else {
        document.getElementById("liverJaundiceCluster").style.display = "none";
    }
}


function urinaryQuestions() {
    var urinaryCheckbox = document.getElementById("urinaryIssues");
    
    if (urinaryCheckbox.checked) {
        document.getElementById("urinaryCluster").style.display = "block";
    } else {
        document.getElementById("urinaryCluster").style.display = "none";
    }
}

function thyroidQuestions() {
    var thyroidCheckbox = document.getElementById("thyroidIssues");
    
    if (thyroidCheckbox.checked) {
        document.getElementById("thyroidCluster").style.display = "block";
    } else {
        document.getElementById("thyroidCluster").style.display = "none";
    }
}

function lymphaticQuestions() {
    var lymphaticCheckbox = document.getElementById("lymphaticIssues");
    
    if (lymphaticCheckbox.checked) {
        document.getElementById("lymphaticCluster").style.display = "block";
    } else {
        document.getElementById("lymphaticCluster").style.display = "none";
    }
}

function criticalIndicators() {
    var acuteLiverCheckbox = document.getElementById("acuteLiver");
    var comaCheckbox = document.getElementById("coma");
    
    if (acuteLiverCheckbox.checked || comaCheckbox.checked) {
        document.getElementById("criticalIndicatorsSection").style.display = "block";
    } else {
        document.getElementById("criticalIndicatorsSection").style.display = "none";
    }
}

function historyRelated() {
    var alcoholHistoryCheckbox = document.getElementById("alcoholHistory");
    
    if (alcoholHistoryCheckbox.checked) {
        document.getElementById("historyRelatedSection").style.display = "block";
    } else {
        document.getElementById("historyRelatedSection").style.display = "none";
    }
}

function sexualCluster() {
    var sexualIssuesCheckbox = document.getElementById("sexualIssues");
    
    if (sexualIssuesCheckbox.checked) {
        document.getElementById("sexualCluster").style.display = "block";
    } else {
        document.getElementById("sexualCluster").style.display = "none";
    }
}

window.onload = function () {
    toggleQuestions();  
    feverQuestions();
    painQuestions();
    skinQuestions();
    digestiveQuestions();
    respiratoryQuestions();
    urinaryQuestions();
    thyroidQuestions();
    lymphaticQuestions();
    criticalIndicators();
    historyRelated();
    sexualCluster();
}
function getCheckedSymptoms() {
    const inputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    const checkedSymptoms = [];

    inputs.forEach(input => {
        if (input.checked) {
            let symptomText = "";

            // Get label text
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                symptomText = label.textContent.trim();
            } else if (input.closest('label')) {
                symptomText = input.closest('label').textContent.trim();
            }

            if (symptomText) {
                // Preprocess symptom: trim, replace spaces with underscores, convert to lowercase
                const processedSymptom = symptomText.trim().replace(/\s+/g, "_").toLowerCase();
                checkedSymptoms.push(processedSymptom);
            }
        }
    });

    return checkedSymptoms;
}

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const symptoms = getCheckedSymptoms();

    fetch('/symptom', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symptoms: symptoms })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Prediction Response:", data);
        // Redirect to results page with prediction data
        const encodedData = encodeURIComponent(JSON.stringify(data));
        window.location.href = `/prediction-result?data=${encodedData}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again.');
    });
});



