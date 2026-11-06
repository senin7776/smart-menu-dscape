// Track current step
let currentStep = 1;
const totalSteps = 4;

// Store form data
const formData = {
    ownerName: '',
    businessEmail: '',
    mobileNumber: '',
    password: '',
    restaurantName: '',
    cuisine: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    contactNumber: '',
    restaurantEmail: '',
    website: '',
    tables: '',
    operatingHours: '',
    selectedPlan: 'growth',
    logo: null
};

// Open registration modal
function openRegistrationModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('registration-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Reset to step 1
        currentStep = 1;
        initializeStep(1);
        // Clear all forms
        resetAllForms();
        // IMPORTANT: Setup event listeners NOW when modal opens
        setupEventListeners();
        setupLogoUpload();
        setupPricingCards();
        setupCardFormatting();
        console.log('Modal opened and forms initialized');
    }
}

// Close registration modal
function closeRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset to step 1
        currentStep = 1;
        initializeStep(1);
    }
}

// Reset all forms
function resetAllForms() {
    const forms = ['form-step-1', 'form-step-2', 'form-step-3', 'form-step-4'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.reset();
    });

    // Reset logo preview
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview) {
        logoPreview.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#999" stroke-width="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
    }

    // Clear form data
    for (let key in formData) {
        if (key === 'selectedPlan') {
            formData[key] = 'growth';
        } else {
            formData[key] = '';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Don't initialize forms until modal opens
    console.log('Page loaded, forms will be initialized when modal opens');
});

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    const form1 = document.getElementById('form-step-1');
    const form2 = document.getElementById('form-step-2');
    const form3 = document.getElementById('form-step-3');
    const form4 = document.getElementById('form-step-4');

    if (form1) {
        // Remove old listener first
        form1.removeEventListener('submit', handleStep1Submit);
        form1.addEventListener('submit', handleStep1Submit);
        console.log('Form 1 attached');
    }
    if (form2) {
        form2.removeEventListener('submit', handleStep2Submit);
        form2.addEventListener('submit', handleStep2Submit);
        console.log('Form 2 attached');
    }
    if (form3) {
        form3.removeEventListener('submit', handleStep3Submit);
        form3.addEventListener('submit', handleStep3Submit);
        console.log('Form 3 attached');
    }
    if (form4) {
        form4.removeEventListener('submit', handleStep4Submit);
        form4.addEventListener('submit', handleStep4Submit);
        console.log('Form 4 attached');
    }
}

// Handle Step 1 submission
function handleStep1Submit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Step 1 submit triggered');

    const ownerName = document.getElementById('owner-name').value.trim();
    const businessEmail = document.getElementById('business-email').value.trim();
    const mobileNumber = document.getElementById('mobile-number').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAccept = document.getElementById('terms-accept').checked;

    // Validate
    if (!ownerName || !businessEmail || !mobileNumber || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match. Please make sure both passwords are the same.');
        return false;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return false;
    }

    if (!termsAccept) {
        const termsError = document.getElementById('terms-error');
        if (termsError) termsError.classList.add('show');
        alert('Please accept the Terms of Service and Privacy Policy to continue.');
        return false;
    }

    // Save data
    formData.ownerName = ownerName;
    formData.businessEmail = businessEmail;
    formData.mobileNumber = mobileNumber;
    formData.password = password;

    console.log('Step 1 valid, going to step 2');
    // Go to next step
    nextStep();
    return false;
}

// Handle Step 2 submission
function handleStep2Submit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Step 2 submit triggered');

    const restaurantName = document.getElementById('restaurant-name').value.trim();
    const cuisine = document.getElementById('cuisine-category').value;
    const description = document.getElementById('description').value.trim();
    const address = document.getElementById('full-address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postal-code').value.trim();
    const contactNumber = document.getElementById('contact-number').value.trim();
    const restaurantEmail = document.getElementById('restaurant-email').value.trim();
    const website = document.getElementById('website').value.trim();
    const tables = document.getElementById('tables').value;
    const operatingHours = document.getElementById('operating-hours').value.trim();

    // Validate
    if (!restaurantName || !cuisine || !description || !address || !city || !postalCode || !contactNumber || !restaurantEmail || !tables || !operatingHours) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Save data
    formData.restaurantName = restaurantName;
    formData.cuisine = cuisine;
    formData.description = description;
    formData.address = address;
    formData.city = city;
    formData.postalCode = postalCode;
    formData.contactNumber = contactNumber;
    formData.restaurantEmail = restaurantEmail;
    formData.website = website;
    formData.tables = tables;
    formData.operatingHours = operatingHours;

    console.log('Step 2 valid, going to step 3');
    // Go to next step
    nextStep();
    return false;
}

// Handle Step 3 submission
function handleStep3Submit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Step 3 submit triggered');

    const selectedPlan = document.querySelector('input[name="plan"]:checked');

    if (!selectedPlan) {
        alert('Please select a plan.');
        return false;
    }

    formData.selectedPlan = selectedPlan.value;

    console.log('Step 3 valid, going to step 4');
    // Go to next step
    nextStep();
    return false;
}

// Handle Step 4 submission (simulate payment)
function handleStep4Submit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Step 4 submit triggered');

    // Show success screen
    showSuccessScreen();
    return false;
}

// Navigate to next step
function nextStep() {
    console.log('nextStep called, current:', currentStep);
    if (currentStep < totalSteps) {
        currentStep++;
        console.log('Moving to step:', currentStep);
        initializeStep(currentStep);
    }
}

// Navigate to previous step
function previousStep() {
    console.log('previousStep called, current:', currentStep);
    if (currentStep > 1) {
        currentStep--;
        console.log('Moving to step:', currentStep);
        initializeStep(currentStep);
    }
}

// Initialize a specific step
function initializeStep(stepNumber) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    const currentStepEl = document.getElementById(`step-${stepNumber}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }

    // Update progress sidebar
    updateProgressSidebar(stepNumber);

    // Scroll modal to top
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

// Update progress sidebar
function updateProgressSidebar(stepNumber) {
    for (let i = 1; i <= totalSteps; i++) {
        const progressStep = document.getElementById(`progress-step-${i}`);
        if (!progressStep) continue;

        if (i < stepNumber) {
            progressStep.classList.add('completed');
            progressStep.classList.remove('active');
        } else if (i === stepNumber) {
            progressStep.classList.add('active');
            progressStep.classList.remove('completed');
        } else {
            progressStep.classList.remove('active', 'completed');
        }
    }
}

// Setup logo upload
function setupLogoUpload() {
    const logoInput = document.getElementById('logo-input');
    const logoPreview = document.getElementById('logo-preview');

    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];

            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = function (event) {
                    logoPreview.innerHTML = `<img src="${event.target.result}" alt="Restaurant logo" />`;
                    formData.logo = event.target.result;
                };

                reader.readAsDataURL(file);
            }
        });
    }
}

// Setup pricing cards
function setupPricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove active from all
            pricingCards.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            this.classList.add('active');

            // Check the radio
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
}

// Show success screen
function showSuccessScreen() {
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Show success screen
    const successScreen = document.getElementById('step-success');
    if (successScreen) {
        successScreen.classList.add('active');
    }

    // Update progress sidebar - mark all complete
    for (let i = 1; i <= totalSteps; i++) {
        const progressStep = document.getElementById(`progress-step-${i}`);
        if (progressStep) {
            progressStep.classList.add('completed');
            progressStep.classList.remove('active');
        }
    }

    // Populate success details
    const successRestaurant = document.getElementById('success-restaurant');
    const successPlan = document.getElementById('success-plan');

    if (successRestaurant) {
        successRestaurant.textContent = formData.restaurantName || 'Nara House';
    }
    if (successPlan) {
        successPlan.textContent = capitalizeFirstLetter(formData.selectedPlan) + ' · Annual';
    }

    // Scroll to top
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

// Helper function
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Format card inputs
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\s/g, '').replace(/\//g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }
}

// Make functions globally accessible
window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.previousStep = previousStep;
