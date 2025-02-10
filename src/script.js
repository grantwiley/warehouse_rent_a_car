// Date validation utilities
function validateDate(dateInput) {
    if (!dateInput.value) return true;
    
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate.getDay() === 0) {
        alert('We are closed on Sundays. Please select another day.');
        dateInput.value = '';
        return false;
    }
    
    if (selectedDate < today) {
        alert('Please select a future date.');
        dateInput.value = '';
        return false;
    }
    
    return true;
}

// Initialize EmailJS
try {
    emailjs.init('Ij6nI-ZNRp56im9-x');
    console.log('EmailJS initialized successfully');
} catch (error) {
    console.error('EmailJS initialization failed:', error);
}

class RentalQuoteForm {
    constructor() {
        this.formData = {};
        this.currentQuestionIndex = -1;
        this.questions = [
            {
                id: 'age-license',
                text: 'Are all drivers licensed and 25 years old or older?',
                name: 'age_license'
            },
            {
                id: 'insurance',
                text: 'Do all renters carry full coverage automobile insurance with comprehensive and collision deductibles no higher than $500?',
                name: 'insurance'
            },
            {
                id: 'out-of-state',
                text: 'Will your trip take you out of the state of Virginia?',
                name: 'out_of_state'
            }
        ];

        this.initializeForm();
    }

    initializeForm() {
        this.quoteForm = document.getElementById('quote-form');
        this.quoteResult = document.getElementById('quote-result');
        this.pickupDateInput = document.getElementById('pickup-date');
        this.returnDateInput = document.getElementById('return-date');

        if (!this.quoteForm || !this.quoteResult) {
            console.error('Required form elements not found');
            return;
        }

        this.setupDateInputs();
        this.setupFormSubmission();
    }

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];

        if (this.pickupDateInput) {
            this.pickupDateInput.min = today;
            this.pickupDateInput.addEventListener('change', () => this.handleDateChange('pickup'));
        }

        if (this.returnDateInput) {
            this.returnDateInput.min = today;
            this.returnDateInput.addEventListener('change', () => this.handleDateChange('return'));
        }
    }

    handleDateChange(type) {
        const pickupDate = new Date(this.pickupDateInput.value);
        const returnDate = new Date(this.returnDateInput.value);

        if (type === 'pickup') {
            if (!validateDate(this.pickupDateInput)) return;
            if (this.returnDateInput.value && returnDate <= pickupDate) {
                alert('Return date must be after pickup date.');
                this.returnDateInput.value = '';
            }
        } else {
            if (!validateDate(this.returnDateInput)) return;
            if (this.pickupDateInput.value && returnDate <= pickupDate) {
                alert('Return date must be after pickup date.');
                this.returnDateInput.value = '';
            }
        }
    }

    setupFormSubmission() {
        this.quoteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateInitialForm()) return;
        
        this.formData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            vehicleType: document.getElementById('vehicle-type').value,
            pickupDate: this.pickupDateInput.value,
            returnDate: this.returnDateInput.value,
            answers: {}
        };

        this.showNextQuestion();
    }

    validateInitialForm() {
        if (!this.pickupDateInput.value || !this.returnDateInput.value) {
            alert('Please select both pickup and return dates.');
            return false;
        }

        const pickupDate = new Date(this.pickupDateInput.value);
        const returnDate = new Date(this.returnDateInput.value);

        if (returnDate <= pickupDate) {
            alert('Return date must be after pickup date.');
            return false;
        }

        return true;
    }

    createQuestionHTML(question) {
        return `
            <div class="form-group">
                <label>${question.text}</label>
                <div class="radio-group">
                    <label>
                        <input type="radio" name="${question.name}" value="yes" required> Yes
                    </label>
                    <label>
                        <input type="radio" name="${question.name}" value="no" required> No
                    </label>
                </div>
            </div>
            <div class="button-group">
                <button type="button" class="back-button">Back</button>
                <button type="button" class="cancel-button">Cancel</button>
                <button type="button" class="next-button">Continue</button>
            </div>
        `;
    }

    showNextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.quoteForm.style.display = 'none';
            this.quoteResult.style.display = 'block';
            this.quoteResult.innerHTML = this.createQuestionHTML(this.questions[this.currentQuestionIndex]);
            this.setupQuestionHandlers();
        } else {
            this.showRateOptions();
        }
    }

    showPreviousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.quoteResult.innerHTML = this.createQuestionHTML(this.questions[this.currentQuestionIndex]);
            this.setupQuestionHandlers();
        } else {
            this.quoteForm.style.display = 'block';
            this.quoteResult.style.display = 'none';
            this.currentQuestionIndex = -1;
        }
    }

    setupQuestionHandlers() {
        const nextButton = this.quoteResult.querySelector('.next-button');
        const backButton = this.quoteResult.querySelector('.back-button');
        const cancelButton = this.quoteResult.querySelector('.cancel-button');

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const radioButtons = this.quoteResult.querySelectorAll('input[type="radio"]');
                const selectedAnswer = Array.from(radioButtons).find(radio => radio.checked);

                if (selectedAnswer) {
                    this.formData.answers[this.questions[this.currentQuestionIndex].name] = selectedAnswer.value;
                    this.showNextQuestion();
                } else {
                    alert('Please select an answer before continuing.');
                }
            });
        }

        if (backButton) {
            backButton.addEventListener('click', () => this.showPreviousQuestion());
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                window.location.href = '/quote/';
            });
        }
    }

    showRateOptions() {
        const pickupDate = new Date(this.formData.pickupDate);
        const returnDate = new Date(this.formData.returnDate);
        const numDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));

        const quote100 = calculateQuote(this.formData.vehicleType, '100', this.formData.answers.insurance, numDays);
        const quote200 = calculateQuote(this.formData.vehicleType, '200', this.formData.answers.insurance, numDays);

        if (!quote200) {
            alert('Unable to calculate rates for the selected vehicle type.');
            return;
        }

        const rateOptionsHTML = this.createRateOptionsHTML(quote100, quote200, numDays);
        this.quoteResult.innerHTML = rateOptionsHTML;
        this.setupRateOptionHandlers();
    }

    createRateOptionsHTML(quote100, quote200, numDays) {
        return `
            <h3>Select Your Mileage Package</h3>
            ${quote100 ? `
            <div class="rate-option" data-mileage="100">
                <h4>100 Mile Package - $${quote100.base_rate}/day for ${numDays} days</h4>
                <p>Base Rate: $${quote100.base_rate}/day (Total: $${(quote100.base_rate * numDays).toFixed(2)})</p>
                <p>Facility Fee: $${quote100.facility_fee}</p>
                ${quote100.insurance ? `<p>Insurance: $${quote100.insurance}</p>` : ''}
                <p>Tax: $${quote100.tax.toFixed(2)}</p>
                <p class="total">Total: $${quote100.total}/day</p>
                <p class="deposit">Required Deposit: $${this.formData.answers.out_of_state === 'yes' ? quote100.deposit.out_of_state : quote100.deposit.in_state}</p>
                <button class="select-rate" data-mileage="100">Select 100 Mile Package</button>
            </div>` : ''}
            <div class="rate-option" data-mileage="200">
                <h4>200 Mile Package - $${quote200.base_rate}/day for ${numDays} days</h4>
                <p>Base Rate: $${quote200.base_rate}/day (Total: $${(quote200.base_rate * numDays).toFixed(2)})</p>
                <p>Facility Fee: $${quote200.facility_fee}</p>
                ${quote200.insurance ? `<p>Insurance: $${quote200.insurance}</p>` : ''}
                <p>Tax: $${quote200.tax.toFixed(2)}</p>
                <p class="total">Total: $${quote200.total}/day</p>
                <p class="deposit">Required Deposit: $${this.formData.answers.out_of_state === 'yes' ? quote200.deposit.out_of_state : quote200.deposit.in_state}</p>
                <button class="select-rate" data-mileage="200">Select 200 Mile Package</button>
            </div>
            <div class="button-group">
                <button type="button" class="back-button">Back</button>
                <button type="button" class="cancel-button">Cancel</button>
            </div>
        `;
    }

    setupRateOptionHandlers() {
        const rateButtons = this.quoteResult.querySelectorAll('.select-rate');
        const backButton = this.quoteResult.querySelector('.back-button');
        const cancelButton = this.quoteResult.querySelector('.cancel-button');

        rateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.formData.selectedMileage = e.target.dataset.mileage;
                this.sendEmail();
            });
        });

        if (backButton) {
            backButton.addEventListener('click', () => this.showPreviousQuestion());
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                window.location.href = '/quote/';
            });
        }
    }

    sendEmail() {
        const quote = calculateQuote(this.formData.vehicleType, this.formData.selectedMileage, this.formData.answers.insurance);
        
        emailjs.send('service_b8f7bys', 'template_p0lem5c', {
            first_name: this.formData.firstName,
            last_name: this.formData.lastName,
            email: this.formData.email,
            phone: this.formData.phone,
            vehicle_type: this.formData.vehicleType,
            pickup_date: this.formData.pickupDate,
            return_date: this.formData.returnDate,
            age_license: this.formData.answers.age_license,
            insurance: this.formData.answers.insurance,
            out_of_state: this.formData.answers.out_of_state,
            mileage_package: this.formData.selectedMileage,
            daily_rate: quote.base_rate,
            facility_fee: quote.facility_fee,
            insurance_fee: quote.insurance,
            tax: quote.tax.toFixed(2),
            total_daily_rate: quote.total,
            deposit: this.formData.answers.out_of_state === 'yes' ? quote.deposit.out_of_state : quote.deposit.in_state
        })
        .then(() => this.showThankYouMessage())
        .catch((error) => {
            console.error('Email sending failed:', error);
            this.showErrorMessage();
        });
    }

    showThankYouMessage() {
        this.quoteResult.innerHTML = `
            <h3>Thank You For Submitting a Rental Quote. We Will be in Touch With You Asap.</h3>
            <p class="contact-info">Warehouse Rent a Car is currently updating rates. If you have any further questions, please contact us by phone call or text message at 540-213-0202 or by email at rental@cawcaw.com.</p>
        `;
    }

    showErrorMessage() {
        this.quoteResult.innerHTML = `
            <h3>An error occurred while submitting your quote.</h3>
            <p class="contact-info">Please try again or contact us directly at 540-213-0202.</p>
        `;
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RentalQuoteForm();
});