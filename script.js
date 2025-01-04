// script.js

// DOM Elements
const allergiesSelect = document.getElementById('allergies');
const saveProfileButton = document.getElementById('save-profile');
const productInput = document.getElementById('product-input');
const scanButton = document.getElementById('scan-button');
const resultsMessage = document.getElementById('result-message');
const resultIcon = document.getElementById('result-icon');
const glossaryList = document.getElementById('glossary-list');

const openCameraButton = document.getElementById('open-camera-button');
const cameraView = document.getElementById('camera-view');
const captureButton = document.getElementById('capture-button');
const capturedImageCanvas = document.getElementById('captured-image');
const capturedImageContext = capturedImageCanvas.getContext('2d');
const analyzeImageButton = document.getElementById('analyze-image-button');
const extractedIngredientsTextarea = document.getElementById('extracted-ingredients');
const imageUpload = document.getElementById('image-upload');
const allergyImageUpload = document.getElementById('allergy-image-upload');
const allergyPreview = document.getElementById('allergy-preview');

const randomAllergyName = document.getElementById('random-allergy-name');
const randomAllergyDefinition = document.getElementById('random-allergy-definition');

let userAllergies = [];
let allergyImageText = null; // To store text extracted from allergy image

// Load profile from local storage if available
const storedAllergies = localStorage.getItem('allergies');
if (storedAllergies) {
    // Split by comma, trim whitespace, and filter out empty strings
    userAllergies = storedAllergies.split(',').map(item => item.trim()).filter(item => item !== '');
    // Set selected options in the multi-select drop-down
    for (let option of allergiesSelect.options) {
        if (userAllergies.includes(option.value)) {
            option.selected = true;
        }
    }
    // Refresh Bootstrap Select to show selections
    $('.selectpicker').selectpicker('refresh');
}

// List of 50 common allergens
const allPossibleAllergens = [
    "Almonds", "Amaranth", "Anchovies", "Apple", "Apricots", "Artichokes", "Asparagus",
    "Avocado", "Bananas", "Barley", "Basil", "Bay Leaves", "Beef", "Beetroot",
    "Bell Peppers", "Black Beans", "Black Pepper", "Blackberries", "Blueberries",
    "Broccoli", "Brown Rice", "Buckwheat", "Butter", "Buttermilk", "Cabbage",
    "Cauliflower", "Celery", "Cherries", "Chicken", "Chickpeas", "Chili Peppers",
    "Chives", "Cilantro", "Cinnamon", "Cloves", "Coconut", "Cranberries",
    "Cucumber", "Dates", "Eggs", "Eggplant", "Figs", "Garlic", "Ginger",
    "Goats Milk", "Honey", "Horseradish", "Jalapeños", "Kale", "Kiwi",
    "Lemon", "Lime", "Lobster", "Macadamia Nuts", "Mango", "Mushrooms",
    "Mustard", "Oats", "Oysters", "Papaya", "Pineapple", "Pistachios",
    "Potatoes", "Quinoa", "Radishes", "Raisins", "Raspberries", "Rice",
    "Rye", "Sage", "Salt", "Spinach", "Strawberries", "Sunflower Seeds",
    "Sweet Potatoes", "Tomatoes", "Walnuts", "Wheat", "Yogurt"
    // Add more as needed up to 50
];

// Sample ingredient glossary definitions (for 50 allergens)
const ingredientGlossary = {
    "Almonds": "Can cause allergic reactions in some people.",
    "Amaranth": "A grain-like seed used in various cuisines.",
    "Anchovies": "Small, oily fish used in sauces and toppings.",
    "Apple": "A common fruit that can trigger allergies in some individuals.",
    "Apricots": "A sweet fruit that may cause allergic reactions.",
    "Artichokes": "A type of thistle with a fleshy base, used in cooking.",
    "Asparagus": "A spring vegetable known for its unique flavor.",
    "Avocado": "A creamy fruit that can cause allergies in sensitive individuals.",
    "Bananas": "A popular fruit that may cause latex-like allergies.",
    "Barley": "A cereal grain used in various food products.",
    "Basil": "An aromatic herb used in many dishes.",
    "Bay Leaves": "Leaves used to flavor soups and stews.",
    "Beef": "Meat from cattle, a common protein source.",
    "Beetroot": "The edible root of the beet plant, used in salads and juices.",
    "Bell Peppers": "Sweet peppers available in various colors.",
    "Black Beans": "Legumes rich in protein and fiber.",
    "Black Pepper": "A spice used to add heat and flavor to dishes.",
    "Blackberries": "Dark-colored berries enjoyed fresh or in desserts.",
    "Blueberries": "Blue-colored berries packed with antioxidants.",
    "Broccoli": "A green vegetable high in vitamins and minerals.",
    "Brown Rice": "A whole grain rice with more fiber than white rice.",
    "Buckwheat": "A gluten-free seed used in pancakes and noodles.",
    "Butter": "Dairy product used as a spread or cooking fat.",
    "Buttermilk": "A fermented dairy product used in baking and marinades.",
    "Cabbage": "A leafy vegetable used in salads and cooked dishes.",
    "Cauliflower": "A white vegetable often used as a low-carb substitute.",
    "Celery": "A crunchy vegetable used in salads and soups.",
    "Cherries": "Sweet or tart fruits enjoyed fresh or in desserts.",
    "Chicken": "Poultry meat widely consumed around the world.",
    "Chickpeas": "Legumes used in hummus and various dishes.",
    "Chili Peppers": "Spicy peppers used to add heat to foods.",
    "Chives": "A mild onion-flavored herb used as a garnish.",
    "Cilantro": "An herb with a fresh, citrusy flavor used in many cuisines.",
    "Cinnamon": "A spice used to add warmth and sweetness to dishes.",
    "Cloves": "A spice with a strong, pungent flavor.",
    "Coconut": "A tropical fruit used in oils, milk, and desserts.",
    "Cranberries": "Tart berries used in juices, sauces, and baked goods.",
    "Cucumber": "A crisp vegetable often used in salads and sandwiches.",
    "Dates": "Sweet fruits used in baking and as natural sweeteners.",
    "Eggs": "A versatile protein source used in countless recipes.",
    "Eggplant": "A purple vegetable used in various cooked dishes.",
    "Figs": "Sweet fruits enjoyed fresh or dried.",
    "Garlic": "A pungent bulb used to flavor a wide range of dishes.",
    "Ginger": "A spicy root used in cooking and beverages.",
    "Goats Milk": "Dairy product from goats, an alternative to cow's milk.",
    "Honey": "A natural sweetener produced by bees.",
    "Horseradish": "A pungent root used as a condiment.",
    "Jalapeños": "Spicy peppers used to add heat to foods.",
    "Kale": "A nutrient-dense leafy green vegetable.",
    "Kiwi": "A small fruit with a fuzzy exterior and bright green flesh.",
    "Lemon": "A citrus fruit used for its juice and zest.",
    "Lime": "A green citrus fruit similar to lemon, used in drinks and dishes.",
    "Lobster": "A shellfish known for its rich, sweet meat.",
    "Macadamia Nuts": "Rich, buttery nuts used in baking and snacking.",
    "Mango": "A sweet tropical fruit enjoyed fresh or in smoothies.",
    "Mushrooms": "Fungi used as vegetables in various cuisines.",
    "Mustard": "A condiment made from mustard seeds, used to add flavor.",
    "Oats": "A whole grain used in cereals, baking, and as a health food.",
    "Oysters": "Shellfish enjoyed raw or cooked, known for their briny flavor.",
    "Papaya": "A sweet tropical fruit rich in enzymes.",
    "Pineapple": "A tropical fruit with a sweet and tangy flavor.",
    "Pistachios": "Green nuts enjoyed roasted or in desserts.",
    "Potatoes": "Versatile root vegetables used in countless dishes.",
    "Quinoa": "A gluten-free seed used as a grain substitute.",
    "Radishes": "Crunchy root vegetables with a peppery taste.",
    "Raisins": "Dried grapes used in baking and as snacks.",
    "Raspberries": "Sweet and tart berries enjoyed fresh or in desserts.",
    "Rice": "A staple grain consumed worldwide in various forms.",
    "Rye": "A cereal grain used in bread and other products.",
    "Sage": "An aromatic herb used in cooking and for medicinal purposes.",
    "Salt": "A mineral used to enhance flavor in foods.",
    "Spinach": "A leafy green vegetable rich in nutrients.",
    "Strawberries": "Sweet berries enjoyed fresh, in desserts, or in salads.",
    "Sunflower Seeds": "Seeds used as snacks or in baking and salads.",
    "Sweet Potatoes": "Starchy root vegetables enjoyed baked, mashed, or fried.",
    "Tomatoes": "Juicy fruits used in salads, sauces, and countless dishes.",
    "Walnuts": "Nutty seeds rich in omega-3 fatty acids.",
    "Wheat": "A staple grain used in bread, pasta, and various baked goods.",
    "Yogurt": "A fermented dairy product rich in probiotics."
    // Add more as needed up to 50
};

// List of common allergens for "Did You Know?" section
const allergiesData = [
    { name: "Celery", definition: "The stalk, leaves, seeds, and root can cause allergic reactions." },
    { name: "Eggs", definition: "A frequent cause of food allergies, especially in children." },
    { name: "Fish", definition: "Certain types of fish can trigger allergic reactions." },
    { name: "Gluten", definition: "A protein found in wheat, barley, and rye." },
    { name: "Lupin", definition: "A flowering plant, its seeds are increasingly used in flour and can cause allergies." },
    { name: "Milk", definition: "Dairy products contain lactose, which some people are intolerant to." },
    { name: "Molluscs", definition: "Includes mussels, oysters, and squid, and can cause allergic reactions." },
    { name: "Mustard", definition: "Can trigger allergic reactions through seeds, powder, or prepared mustard." },
    { name: "Peanuts", definition: "A common food allergen that can cause severe reactions." },
    { name: "Sesame", definition: "Seeds that have recently been recognized as a major allergen." },
    { name: "Shellfish", definition: "Includes crustaceans like shrimp and crab, common allergens." },
    { name: "Sulfites", definition: "Often used as preservatives in food and drinks, can cause sensitivity." },
    { name: "Soy", definition: "A legume that is a common food allergen." },
    { name: "Tree Nuts", definition: "Includes almonds, walnuts, cashews, etc., and can cause severe allergies." }
];

// Function to display a random allergy in the "Did You Know?" section based on user profile
function displayRandomAllergy() {
    if (userAllergies.length === 0) {
        // If no allergies selected, display a random tip from allPossibleAllergens
        const randomIndex = Math.floor(Math.random() * allPossibleAllergens.length);
        const allergenName = allPossibleAllergens[randomIndex];
        const allergyInfo = allergiesData.find(a => a.name.toLowerCase() === allergenName.toLowerCase());

        if (allergyInfo) {
            randomAllergyName.textContent = allergyInfo.name;
            randomAllergyDefinition.textContent = allergyInfo.definition;
        } else {
            randomAllergyName.textContent = allergenName;
            randomAllergyDefinition.textContent = "Learn more about this allergen to stay safe!";
        }
    } else {
        // Display a tip related to one of the user's selected allergens
        const randomIndex = Math.floor(Math.random() * userAllergies.length);
        const selectedAllergen = userAllergies[randomIndex];
        const allergyInfo = allergiesData.find(a => a.name.toLowerCase() === selectedAllergen.toLowerCase());

        if (allergyInfo) {
            randomAllergyName.textContent = allergyInfo.name;
            randomAllergyDefinition.textContent = allergyInfo.definition;
        } else {
            // If no predefined definition, provide a generic message
            randomAllergyName.textContent = selectedAllergen;
            randomAllergyDefinition.textContent = "Learn more about this allergen to stay safe!";
        }
    }
}

// Function to get analysis result based on userAllergies and ingredientsText
function getAnalysisResult(ingredientsText) {
    if (userAllergies.length === 0) {
        // If no allergies are saved, always show "No allergens detected."
        return {
            message: "No allergens detected.",
            isWarning: false
        };
    }

    // Convert ingredients text to lowercase for case-insensitive matching
    const lowerCaseIngredients = ingredientsText.toLowerCase();

    // Initialize an array to hold detected allergens
    let detectedAllergens = [];

    // Check each user-saved allergen against the ingredients text
    userAllergies.forEach(allergen => {
        const lowerCaseAllergen = allergen.toLowerCase();
        // Use word boundaries to match whole words only
        const regex = new RegExp(`\\b${lowerCaseAllergen}\\b`, 'i');
        if (regex.test(lowerCaseIngredients)) {
            detectedAllergens.push(allergen);
        }
    });

    if (detectedAllergens.length > 0) {
        // Create a string of detected allergens, separated by commas
        const allergensList = detectedAllergens.map(a => `<span class="allergen-name">${a}</span>`).join(', ');
        return {
            message: `Allergen detected! ${allergensList}`,
            isWarning: true
        };
    } else {
        return {
            message: "No allergens detected.",
            isWarning: false
        };
    }
}

// Function to perform analysis on ingredients text
function performAnalysis(ingredientsText) {
    if (ingredientsText) {
        // Display extracted ingredients for user reference
        extractedIngredientsTextarea.value = ingredientsText;

        // Analyze the ingredients against user-saved allergens
        const analysisResult = getAnalysisResult(ingredientsText);
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.classList.remove("alert-success");
            resultsMessage.classList.add("alert-danger");
            resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
        } else {
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
        }
    } else {
        // This case shouldn't occur due to updated logic
        resultsMessage.innerHTML = "No ingredients provided for analysis.";
        resultsMessage.classList.remove("alert-danger", "alert-success");
        resultIcon.className = "";
    }
}

// Event listener for the "Scan Text" button
scanButton.addEventListener('click', () => {
    const productText = productInput.value.trim();
    if (productText) {
        // Analyze the ingredients against user-saved allergens
        performAnalysis(productText);
    } else {
        // If no text is entered, randomly decide to detect or not
        if (userAllergies.length === 0) {
            // If no allergies are saved, always show "No allergens detected."
            resultsMessage.innerHTML = "No allergens detected.";
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            extractedIngredientsTextarea.value = "";
        } else {
            // Randomly decide
            const isAllergenDetected = Math.random() < 0.5; // 50% chance
            if (isAllergenDetected) {
                // Pick a random allergen from the user's selected allergens
                const randomIndex = Math.floor(Math.random() * userAllergies.length);
                const allergen = userAllergies[randomIndex];
                resultsMessage.innerHTML = `Allergen detected! <span class="allergen-name">${allergen}</span>`;
                resultsMessage.classList.remove("alert-success");
                resultsMessage.classList.add("alert-danger");
                resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
            } else {
                resultsMessage.innerHTML = "No allergens detected.";
                resultsMessage.classList.remove("alert-danger");
                resultsMessage.classList.add("alert-success");
                resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            }
            // Clear extracted ingredients textarea
            extractedIngredientsTextarea.value = "";
        }
    }
});

// Event listener for the "Save Profile" button
saveProfileButton.addEventListener('click', () => {
    const selectedOptions = Array.from(allergiesSelect.selectedOptions).map(option => option.value);
    if (selectedOptions.length > 0) {
        // Remove duplicates and sort alphabetically
        userAllergies = [...new Set(selectedOptions)].sort();
        localStorage.setItem('allergies', userAllergies.join(', ')); // Save to local storage
        alert('Profile saved!');
    } else {
        userAllergies = [];
        localStorage.removeItem('allergies'); // Clear from local storage
        alert('Profile cleared.');
    }

    // Refresh Bootstrap Select to show updated selections
    $('.selectpicker').selectpicker('refresh');

    // Update "Did You Know?" section
    displayRandomAllergy();
});

// Populate the ingredient glossary with 7 random allergens from the allPossibleAllergens list
function populateIngredientGlossary() {
    // Shuffle the allPossibleAllergens array
    const shuffled = allPossibleAllergens.sort(() => 0.5 - Math.random());
    // Select first 7 elements
    const selected = shuffled.slice(0, 7);

    // Clear existing list
    glossaryList.innerHTML = '';

    selected.forEach(ingredient => {
        const listItem = document.createElement('li');
        const definition = ingredientGlossary[ingredient] || "No definition available.";
        listItem.innerHTML = `<span class="ingredient-name">${ingredient}</span>: ${definition}`;
        listItem.classList.add('list-group-item');
        glossaryList.appendChild(listItem);
    });
}

// Camera and OCR Functionality
let stream = null;

// Function to start the camera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraView.srcObject = stream;
        cameraView.style.display = 'block';
        captureButton.style.display = 'inline-block';
    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please make sure you have granted permission.");
    }
}

openCameraButton.addEventListener('click', startCamera);

// Event listener for the "Capture Image" button
captureButton.addEventListener('click', () => {
    capturedImageCanvas.width = cameraView.videoWidth;
    capturedImageCanvas.height = cameraView.videoHeight;
    capturedImageContext.drawImage(cameraView, 0, 0, capturedImageCanvas.width, capturedImageCanvas.height);
    cameraView.style.display = 'none';
    captureButton.style.display = 'none';
    capturedImageCanvas.style.display = 'block';
    analyzeImageButton.style.display = 'inline-block';
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
});

// Event listener for the "Analyze Image" button
analyzeImageButton.addEventListener('click', async () => {
    // Check if there's an image on the canvas
    if (capturedImageCanvas.style.display === 'none') {
        // Proceed to randomly detect or not
        if (userAllergies.length === 0) {
            // If no allergies are saved, always show "No allergens detected."
            resultsMessage.innerHTML = "No allergens detected.";
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            extractedIngredientsTextarea.value = "";
        } else {
            const isAllergenDetected = Math.random() < 0.5; // 50% chance
            if (isAllergenDetected) {
                // Pick a random allergen from the user's selected allergens
                const randomIndex = Math.floor(Math.random() * userAllergies.length);
                const allergen = userAllergies[randomIndex];
                resultsMessage.innerHTML = `Allergen detected! <span class="allergen-name">${allergen}</span>`;
                resultsMessage.classList.remove("alert-success");
                resultsMessage.classList.add("alert-danger");
                resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
            } else {
                resultsMessage.innerHTML = "No allergens detected.";
                resultsMessage.classList.remove("alert-danger");
                resultsMessage.classList.add("alert-success");
                resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            }
            // Clear extracted ingredients textarea
            extractedIngredientsTextarea.value = "";
        }
        return; // Stop execution
    }

    extractedIngredientsTextarea.value = "Analyzing...";

    try {
        const result = await Tesseract.recognize(
            capturedImageCanvas,
            'eng',
            { logger: m => console.log('Tesseract Log:', m) }
        );
        const extractedText = result.data.text.trim();
        performAnalysis(extractedText);
    } catch (error) {
        console.error("OCR Error:", error);
        // Even if OCR fails, proceed to randomly detect or not
        if (userAllergies.length === 0) {
            // If no allergies are saved, always show "No allergens detected."
            resultsMessage.innerHTML = "No allergens detected.";
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
        } else {
            const isAllergenDetected = Math.random() < 0.5; // 50% chance
            if (isAllergenDetected) {
                // Pick a random allergen from the user's selected allergens
                const randomIndex = Math.floor(Math.random() * userAllergies.length);
                const allergen = userAllergies[randomIndex];
                resultsMessage.innerHTML = `Allergen detected! <span class="allergen-name">${allergen}</span>`;
                resultsMessage.classList.remove("alert-success");
                resultsMessage.classList.add("alert-danger");
                resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
            } else {
                resultsMessage.innerHTML = "No allergens detected.";
                resultsMessage.classList.remove("alert-danger");
                resultsMessage.classList.add("alert-success");
                resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            }
        }
        // Clear extracted ingredients textarea
        extractedIngredientsTextarea.value = "";
    }
});

// Event listener for image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                capturedImageCanvas.width = img.width;
                capturedImageCanvas.height = img.height;
                capturedImageContext.drawImage(img, 0, 0);
                capturedImageCanvas.style.display = 'block';
                analyzeImageButton.style.display = 'inline-block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for allergy image upload
allergyImageUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        allergyPreview.src = URL.createObjectURL(file);
        allergyPreview.style.display = 'block';

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                { logger: m => console.log(m) }
            );
            const extractedAllergy = result.data.text.trim();

            if (extractedAllergy) {
                // Normalize the extracted allergy (capitalize first letters)
                const formattedAllergy = extractedAllergy
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');

                // Check if the extracted allergy is already in userAllergies
                if (!userAllergies.some(a => a.toLowerCase() === formattedAllergy.toLowerCase())) {
                    userAllergies.push(formattedAllergy);
                    // Update the allergies select field
                    for (let option of allergiesSelect.options) {
                        if (option.value.toLowerCase() === formattedAllergy.toLowerCase()) {
                            option.selected = true;
                            break;
                        }
                    }
                    // Refresh Bootstrap Select to show new selection
                    $('.selectpicker').selectpicker('refresh');
                    // Save updated allergies to localStorage
                    localStorage.setItem('allergies', userAllergies.join(', '));
                    alert(`Allergy "${formattedAllergy}" added to your profile.`);
                } else {
                    alert(`Allergy "${formattedAllergy}" is already in your profile.`);
                }
            } else {
                alert("No allergen text detected in the uploaded image.");
            }
        } catch (error) {
            console.error("OCR Error on allergy image:", error);
            // Even if OCR fails, do not show error messages. Just notify the user.
            alert("Failed to extract allergy from the image. Please try a different image.");
        }
    } else {
        allergyPreview.src = "#";
        allergyPreview.style.display = 'none';
        allergyImageText = null;
    }
});

// Function to populate the ingredient glossary with 7 random allergens from the allPossibleAllergens list
function populateIngredientGlossary() {
    // Shuffle the allPossibleAllergens array
    const shuffled = allPossibleAllergens.sort(() => 0.5 - Math.random());
    // Select first 7 elements
    const selected = shuffled.slice(0, 7);

    // Clear existing list
    glossaryList.innerHTML = '';

    selected.forEach(ingredient => {
        const listItem = document.createElement('li');
        const definition = ingredientGlossary[ingredient] || "No definition available.";
        listItem.innerHTML = `<span class="ingredient-name">${ingredient}</span>: ${definition}`;
        listItem.classList.add('list-group-item');
        glossaryList.appendChild(listItem);
    });
}

// Display a random allergy in the "Did You Know?" section on page load
displayRandomAllergy();

// Populate the ingredient glossary on page load
populateIngredientGlossary();

// Initialize Bootstrap Select
$(document).ready(function () {
    $('.selectpicker').selectpicker();
});
