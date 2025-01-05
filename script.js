// List of common allergens
const allergensList = [
    "Peanuts", "Milk", "Soy", "Gluten", "Eggs", "Tree Nuts", "Sesame", "Celery", "Fish", "Mustard",
    "Shellfish", "Sulfites", "Lupin", "Molluscs", "Wheat", "Pork", "Lamb", "Dairy", "Sorghum",
    "Yeast", "Maple", "Cottonseed", "Canola", "Sunflower", "Almonds", "Cashews", "Hazelnuts",
    "Pistachios", "Walnuts", "Coconut", "Poppy", "Mustard", "Cumin", "Anise", "Fennel", "Coriander",
    "Paprika", "Vanilla", "Cocoa", "Coffee", "Tea", "Spelt", "Rye", "Barley", "Oats", "Kamut",
    "Millet", "Quinoa", "Chia", "Flaxseeds", "Hemp"
];

// Initialize the application
$(document).ready(function () {
    // Populate the allergy select dropdown
    populateAllergiesDropdown();

    // Load saved allergies from localStorage
    loadSavedAllergies();

    // Event listeners
    $('#saveProfile').click(saveProfile);
    $('#uploadAllergyImage').click(uploadAllergyImage);
    $('#analyzeText').click(analyzeText);
    $('#analyzeImage').click(analyzeImage);
    $('#openCamera').click(openCamera);

    // Initialize "Did You Know?" and Glossary sections
    updateDidYouKnow();
    updateIngredientGlossary();
});

// Populate the allergies dropdown
function populateAllergiesDropdown() {
    $.each(allergensList, function (index, allergen) {
        $('#allergiesSelect').append($('<option>', {
            value: allergen,
            text: allergen
        }));
    });
    $('#allergiesSelect').selectpicker();
}

// Load saved allergies from localStorage
function loadSavedAllergies() {
    const savedAllergies = JSON.parse(localStorage.getItem('userAllergies')) || [];
    if (savedAllergies.length > 0) {
        $('#allergiesSelect').selectpicker('val', savedAllergies);
    }
}

// Save user profile (selected allergies)
function saveProfile() {
    const selectedAllergies = $('#allergiesSelect').val() || [];
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies));
    showNotification('Profile saved successfully!', 'success');
}

// Upload and process allergy image
function uploadAllergyImage() {
    const fileInput = $('#allergyImageUpload')[0];
    if (fileInput.files.length === 0) {
        showNotification('Please select an image.', 'warning');
        return;
    }
    processAllergyImage(fileInput.files[0]);
}

// Analyze text for allergens
function analyzeText() {
    resetResultsSection();
    const ingredients = $('#ingredientsTextarea').val();
    if (!ingredients) {
        showNotification('Please enter ingredients.', 'warning');
        return;
    }
    detectAllergens(ingredients);
}

// Analyze image for allergens
function analyzeImage() {
    resetResultsSection();
    const fileInput = $('#productImageUpload')[0];
    if (fileInput.files.length === 0 && !canvasDataURL) {
        showNotification('Please upload an image or capture using camera.', 'warning');
        return;
    }
    let imageSource = canvasDataURL || fileInput.files[0];
    processProductImage(imageSource);
}

// Open camera for image capture
let canvasDataURL = null;
function openCamera() {
    const canvas = $('#canvas')[0];
    const context = canvas.getContext('2d');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            video.addEventListener('play', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0);
                setInterval(() => {
                    context.drawImage(video, 0, 0);
                }, 100);
            });
            // Add a capture button
            const captureButton = document.createElement('button');
            captureButton.className = 'btn btn-secondary mt-2';
            captureButton.textContent = 'Capture';
            captureButton.addEventListener('click', () => {
                context.drawImage(video, 0, 0);
                canvasDataURL = canvas.toDataURL('image/png');
                showNotification('Image captured!', 'success');
                // Stop the stream
                stream.getTracks().forEach(track => track.stop());
                canvasDataURL = null; // Reset for next capture
            });
            $('#openCamera').after(captureButton);
        })
        .catch(error => {
            showNotification('Camera access denied.', 'danger');
            console.error('Error accessing camera:', error);
        });
}

// Detect allergens in text
function detectAllergens(inputText) {
    const selectedAllergies = $('#allergiesSelect').val() || [];
    const detectedAllergens = selectedAllergies.filter(allergen =>
        new RegExp(allergen, 'i').test(inputText)
    );
    if (detectedAllergens.length > 0) {
        $('#resultsSection')
            .removeClass('alert-success')
            .addClass('alert-danger')
            .text(`Allergens Detected: ${detectedAllergens.join(', ')}`)
            .removeClass('d-none');
    } else {
        $('#resultsSection')
            .removeClass('alert-danger')
            .addClass('alert-success')
            .text('No Allergies Detected.')
            .removeClass('d-none');
    }
}

// Process allergy image using OCR
function processAllergyImage(file) {
    showLoadingSpinner();
    Tesseract.recognize(file, 'eng', { logger: console.log })
        .then(result => {
            hideLoadingSpinner();
            const extractedText = result.data.text;
            const detectedAllergens = extractAllergensFromText(extractedText);
            if (detectedAllergens.length > 0) {
                addAllergensToProfile(detectedAllergens);
                showNotification(`Allergens added to profile: ${detectedAllergens.join(', ')}`, 'success');
            } else {
                showNotification('No new allergens detected in the image.', 'info');
            }
        })
        .catch(error => {
            hideLoadingSpinner();
            showNotification('OCR processing failed. Please try again.', 'danger');
            console.error('OCR Error:', error);
        });
}

// Process product image using OCR
function processProductImage(source) {
    showLoadingSpinner();
    Tesseract.recognize(source, 'eng', { logger: console.log })
        .then(result => {
            hideLoadingSpinner();
            const extractedText = result.data.text;
            detectAllergens(extractedText);
        })
        .catch(error => {
            hideLoadingSpinner();
            $('#resultsSection')
                .removeClass('alert-success alert-danger')
                .addClass('alert-danger')
                .text('OCR processing failed. Please try again.')
                .removeClass('d-none');
            console.error('OCR Error:', error);
        });
}

// Extract allergens from text
function extractAllergensFromText(text) {
    const selectedAllergies = $('#allergiesSelect').val() || [];
    const detectedAllergens = selectedAllergies.filter(allergen =>
        new RegExp(allergen, 'i').test(text)
    );
    return detectedAllergens;
}

// Add allergens to user profile
function addAllergensToProfile(allergens) {
    const currentAllergies = $('#allergiesSelect').val() || [];
    const newAllergies = allergens.filter(allergen => !currentAllergies.includes(allergen));
    $('#allergiesSelect').selectpicker('val', [...currentAllergies, ...newAllergies]);
    localStorage.setItem('userAllergies', JSON.stringify([...currentAllergies, ...newAllergies]));
}

// Show notification using Bootstrap Toast
function showNotification(message, type) {
    const toast = $('<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">' +
        `<div class="toast-header bg-${type}">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
        </div>');
    $('.toast-container').append(toast);
    const bsToast = new bootstrap.Toast(toast[0]);
    bsToast.show();
}

// Show loading spinner
function showLoadingSpinner() {
    const spinner = $('<div class="spinner-border text-primary loading-spinner" role="status">' +
        '<span class="visually-hidden">Loading...</span>' +
        '</div>');
    $('#resultsSection').html(spinner).removeClass('d-none');
}

// Hide loading spinner
function hideLoadingSpinner() {
    $('#resultsSection').addClass('d-none');
}

// Reset results section
function resetResultsSection() {
    $('#resultsSection')
        .removeClass('alert-success alert-danger')
        .addClass('d-none');
}

// Update "Did You Know?" section
function updateDidYouKnow() {
    const selectedAllergies = $('#allergiesSelect').val() || [];
    if (selectedAllergies.length > 0) {
        const randomAllergen = selectedAllergies[Math.floor(Math.random() * selectedAllergies.length)];
        const tips = {
            "Peanuts": "Peanuts are a common allergen and can cause severe reactions.",
            "Milk": "Milk allergies are different from lactose intolerance.",
            // Add more tips for other allergens
        };
        const tip = tips[randomAllergen] || "No tip available for this allergen.";
        $('#didYouKnow').text(tip);
    }
}

// Update Ingredient Glossary
function updateIngredientGlossary() {
    const glossaryItems = [
        { allergen: "Peanuts", definition: "A common allergen found in many foods." },
        { allergen: "Milk", definition: "Derived from cows and can cause allergic reactions." },
        // Add more items
    ];
    const selectedAllergies = $('#allergiesSelect').val() || [];
    const filteredGlossary = glossaryItems.filter(item => selectedAllergies.includes(item.allergen));
    if (filteredGlossary.length > 0) {
        const randomItems = shuffleArray(filteredGlossary).slice(0, 7);
        randomItems.forEach(item => {
            $('#ingredientGlossary').append('<li class="list-group-item">' + item.allergen + ': ' + item.definition + '</li>');
        });
    }
}

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
