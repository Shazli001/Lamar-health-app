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

const loadingSpinner = document.getElementById('loading-spinner');

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
    console.log("Loaded allergies from localStorage:", userAllergies);
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
    console.log("Displaying random allergy in 'Did You Know?' section.");
    let relevantAllergies = [];

    if (userAllergies.length === 0) {
        // If no allergies selected, use allPossibleAllergens for tips
        relevantAllergies = allPossibleAllergens;
        console.log("No user allergies selected. Using allPossibleAllergens for tips.");
    } else {
        // Filter allergiesData to include only user-selected allergens
        relevantAllergies = allergiesData.filter(a => userAllergies.includes(a.name));
        console.log("User allergies selected. Relevant allergies for tips:", relevantAllergies);
    }

    if (relevantAllergies.length === 0) {
        // If no relevant allergies found in allergiesData, pick from allPossibleAllergens with a generic message
        const randomIndex = Math.floor(Math.random() * allPossibleAllergens.length);
        const allergenName = allPossibleAllergens[randomIndex];
        randomAllergyName.textContent = allergenName;
        randomAllergyDefinition.textContent = "Learn more about this allergen to stay safe!";
        console.log("No relevant allergies found in allergiesData. Displaying generic tip for:", allergenName);
    } else {
        // Display a tip related to one of the relevant allergens
        const randomIndex = Math.floor(Math.random() * relevantAllergies.length);
        const selectedAllergen = relevantAllergies[randomIndex];
        randomAllergyName.textContent = selectedAllergen.name;
        randomAllergyDefinition.textContent = selectedAllergen.definition;
        console.log("Displaying tip for:", selectedAllergen.name);
    }

    // Add animation by removing and re-adding the animation class
    randomAllergyName.classList.remove('fadeIn');
    randomAllergyDefinition.classList.remove('fadeIn');
    void randomAllergyName.offsetWidth; // Trigger reflow
    void randomAllergyDefinition.offsetWidth; // Trigger reflow
    randomAllergyName.classList.add('fadeIn');
    randomAllergyDefinition.classList.add('fadeIn');
}

// Function to get analysis result based on userAllergies and ingredientsText
function getAnalysisResult(ingredientsText) {
    console.log("Getting analysis result for ingredients:", ingredientsText);
    if (userAllergies.length === 0) {
        // If no allergies are saved, always show "No allergens detected."
        console.log("No user allergies. Returning 'No allergens detected.'");
        return {
            message: "No allergies detected.",
            isWarning: false
        };
    }

    // Initialize an array to hold detected allergens
    let detectedAllergens = [];

    // Check each user-saved allergen against the ingredients text using regex for word boundaries
    userAllergies.forEach(allergen => {
        const regex = new RegExp(`\\b${allergen.toLowerCase()}\\b`, 'i');
        if (regex.test(ingredientsText.toLowerCase())) {
            detectedAllergens.push(allergen);
            console.log(`Detected allergen: ${allergen}`);
        }
    });

    if (detectedAllergens.length > 0) {
        // Create a string of detected allergens, separated by commas
        const allergensList = detectedAllergens.map(a => `<span class="allergen-name">(${a})</span>`).join(', ');
        console.log("Detected allergens:", detectedAllergens);
        return {
            message: `Allergen detected ${allergensList}`,
            isWarning: true
        };
    } else {
        console.log("No allergens detected in the provided ingredients.");
        return {
            message: "No allergies detected.",
            isWarning: false
        };
    }
}

// Function to perform analysis on ingredients text
function performAnalysis(ingredientsText) {
    console.log("Performing analysis on text.");
    if (ingredientsText) {
        // Display extracted ingredients for user reference
        extractedIngredientsTextarea.value = ingredientsText;
        console.log("Displayed extracted ingredients.");

        // Analyze the ingredients against user-saved allergens
        const analysisResult = getAnalysisResult(ingredientsText);
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.classList.remove("alert-success");
            resultsMessage.classList.add("alert-danger");
            resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
            console.log("Displaying alert-danger for detected allergens.");
        } else {
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            console.log("Displaying alert-success for no allergens detected.");
        }

        // Show the results with animation
        resultsMessage.parentElement.classList.add('show');
    } else {
        // This case shouldn't occur due to updated logic
        resultsMessage.innerHTML = "No ingredients provided for analysis.";
        resultsMessage.classList.remove("alert-danger", "alert-success");
        resultIcon.className = "";
        resultsMessage.parentElement.classList.remove('show');
        console.log("No ingredients provided for analysis.");
    }
}

// Event listener for the "Scan Text" button
scanButton.addEventListener('click', () => {
    console.log("Scan Text button clicked.");
    const productText = productInput.value.trim();
    if (productText) {
        console.log("User entered product text:", productText);
        // Analyze the ingredients against user-saved allergens
        performAnalysis(productText);
    } else {
        console.log("No product text entered.");
        // If no text is entered, randomly decide to detect or not
        if (userAllergies.length === 0) {
            // If no allergies are saved, always show "No allergens detected."
            resultsMessage.innerHTML = "No allergies detected.";
            resultsMessage.classList.remove("alert-danger");
            resultsMessage.classList.add("alert-success");
            resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
            resultsMessage.parentElement.classList.add('show');
            extractedIngredientsTextarea.value = "";
            console.log("No user allergies. Displaying 'No allergens detected.'");
        } else {
            // Randomly decide
            const isAllergenDetected = Math.random() < 0.5; // 50% chance
            if (isAllergenDetected) {
                // Pick a random allergen from the user's selected allergens
                const randomIndex = Math.floor(Math.random() * userAllergies.length);
                const allergen = userAllergies[randomIndex];
                resultsMessage.innerHTML = `Allergen detected <span class="allergen-name">(${allergen})</span>`;
                resultsMessage.classList.remove("alert-success");
                resultsMessage.classList.add("alert-danger");
                resultIcon.className = "fas fa-exclamation-triangle me-2"; // Font Awesome exclamation icon
                console.log(`Randomly detected allergen: ${allergen}`);
            } else {
                resultsMessage.innerHTML = "No allergies detected.";
                resultsMessage.classList.remove("alert-danger");
                resultsMessage.classList.add("alert-success");
                resultIcon.className = "fas fa-check-circle me-2"; // Font Awesome check icon
                console.log("Randomly determined no allergies detected.");
            }
            // Show the results with animation
            resultsMessage.parentElement.classList.add('show');
            // Clear extracted ingredients textarea
            extractedIngredientsTextarea.value = "";
        }
    }
});

// Event listener for the "Save Profile" button
saveProfileButton.addEventListener('click', () => {
    console.log("Save Profile button clicked.");
    const selectedOptions = Array.from(allergiesSelect.selectedOptions).map(option => option.value);
    if (selectedOptions.length > 0) {
        // Remove duplicates and sort alphabetically
        userAllergies = [...new Set(selectedOptions)].sort();
        localStorage.setItem('allergies', userAllergies.join(', ')); // Save to local storage
        alert('Profile saved!');
        console.log("Profile saved with allergies:", userAllergies);
    } else {
        userAllergies = [];
        localStorage.removeItem('allergies'); // Clear from local storage
        alert('Profile cleared.');
        console.log("Profile cleared. No allergies selected.");
    }

    // Refresh Bootstrap Select to show updated selections
    $('.selectpicker').selectpicker('refresh');

    // Update "Did You Know?" section
    displayRandomAllergy();
});

// Function to populate the ingredient glossary with 7 random allergens from the allPossibleAllergens list
function populateIngredientGlossary() {
    console.log("Populating ingredient glossary.");
    // Shuffle the allPossibleAllergens array
    const shuffled = allPossibleAllergens.sort(() => 0.5 - Math.random());
    // Select first 7 elements
    const selected = shuffled.slice(0, 7);

    // Clear existing list
    glossaryList.innerHTML = '';

    selected.forEach(ingredient => {
        const listItem = document.createElement('li');
        const definition = ingredientGlossary[ingredient] || "No definition available.";
        listItem.innerHTML = `<span class="ingredient-name">${ingredient}</span>: ${def
