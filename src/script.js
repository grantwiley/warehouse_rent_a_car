// Global variable to prevent multiple date handling
let isHandlingDate = false;

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const header = document.querySelector('.header');

if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// Floating header functionality
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll <= 0) {
    header.classList.remove('scroll-up');
    return;
  }

  if (
    currentScroll > lastScroll &&
    !header.classList.contains('scroll-down')
  ) {
    header.classList.remove('scroll-up');
    header.classList.add('scroll-down');
  } else if (
    currentScroll < lastScroll &&
    header.classList.contains('scroll-down')
  ) {
    header.classList.remove('scroll-down');
    header.classList.add('scroll-up');
  }
  lastScroll = currentScroll;
});

function validateDate(dateInput) {
    if (!dateInput.value) return false;

    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is a Sunday (0)
    if (selectedDate.getDay() === 0) {
        alert('We are closed on Sundays. Please select another day.');
        dateInput.value = '';
        return false;
    }

    // Check if date is in the past
    if (selectedDate < today) {
        alert('Please select a future date.');
        dateInput.value = '';
        return false;
    }

    // Calculate 3 months from today
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    // Check if date is more than 3 months away
    if (selectedDate > threeMonthsFromNow) {
        alert('Bookings cannot be made more than 3 months in advance. Please select a closer date.');
        dateInput.value = '';
        return false;
    }

    return true;
}

// Phone number validation utility
function validatePhoneNumber(phone) {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
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
        name: 'age_license',
      },
      {
        id: 'insurance',
        text:
          'Do all renters carry full coverage automobile insurance with ' +
          'comprehensive and collision deductibles no higher than $500?',
        name: 'insurance',
      },
      {
        id: 'out-of-state',
        text: 'Will your trip take you out of the state of Virginia?',
        name: 'out_of_state',
      },
    ];

    this.initializeForm();
  }

  initializeForm() {
    this.quoteForm = document.getElementById('quote-form');
    this.quoteResult = document.getElementById('quote-result');

    if (!this.quoteForm || !this.quoteResult) {
      console.error('Required form elements not found');
      return;
    }

    this.setupFormSubmission();
  }

  setupFormSubmission() {
    this.quoteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const phoneInput = document.getElementById('phone').value;
    if (!validatePhoneNumber(phoneInput)) {
      alert('Please enter a valid phone number (e.g., 123-456-7890)');
      return;
    }

    this.formData = {
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      email: document.getElementById('email').value,
      phone: phoneInput,
      answers: {},
    };

    this.showVehicleDate();
  }

  createVehicleDateHTML() {
    return `
            <div class="form-group">
                <label>Select Vehicle Type</label>
                <div class="vehicle-options">
                    <div class="vehicle-option">
                        <input type="radio" id="small" name="vehicleType" value="small" required>
                        <label for="small">
                            <img src="/images/smallcar.png" alt="Small Car">
                            <span>Small Car</span>
                        </label>
                    </div>
                    <div class="vehicle-option">
                        <input type="radio" id="midsize" name="vehicleType" value="midsize" required>
                        <label for="midsize">
                            <img src="/images/midcar.png" alt="Mid-Size Car">
                            <span>Mid-Size Car</span>
                        </label>
                    </div>
                    <div class="vehicle-option">
                        <input type="radio" id="fullsize" name="vehicleType" value="fullsize" required>
                        <label for="fullsize">
                            <img src="/images/fullcar.png" alt="Full-Size Car">
                            <span>Full-Size Car</span>
                        </label>
                    </div>
                    <div class="vehicle-option">
                        <input type="radio" id="minivan" name="vehicleType" value="minivan" required>
                        <label for="minivan">
                            <img src="/images/minivan.png" alt="Minivan">
                            <span>Minivan</span>
                        </label>
                    </div>
                    <div class="vehicle-option">
                        <input type="radio" id="passenger-van" name="vehicleType" value="passenger-van" required>
                        <label for="passenger-van">
                            <img src="/images/15PassengerVan.png" alt="15 Passenger Van">
                            <span>15 Passenger Van</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="pickup-date">Pickup Date:</label>
                <input type="date" id="pickup-date" name="pickup-date" required>
            </div>
            <div class="form-group">
                <label for="return-date">Return Date:</label>
                <input type="date" id="return-date" name="return-date" required>
            </div>
            <div class="button-group">
                <button type="button" class="back-button">Back</button>
                <button type="button" class="cancel-button">Cancel</button>
                <button type="button" class="next-button">Continue</button>
            </div>
        `;
  }

  showVehicleDate() {
    this.quoteForm.style.display = 'none';
    this.quoteResult.style.display = 'block';
    this.quoteResult.innerHTML = this.createVehicleDateHTML();
    this.setupVehicleDateHandlers();
    this.setupDateInputs();
  }

  setupDateInputs() {
    this.pickupDateInput = document.getElementById('pickup-date');
    this.returnDateInput = document.getElementById('return-date');

    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (this.pickupDateInput) {
        this.pickupDateInput.min = todayStr;
        this.pickupDateInput.max = maxDateStr;
        
        let pickupTimeout;
        this.pickupDateInput.addEventListener('change', (e) => {
            if (isHandlingDate) return;
            
            // Clear any existing timeout
            if (pickupTimeout) {
                clearTimeout(pickupTimeout);
            }
            
            // Set a small timeout to debounce the event (especially for Safari)
            pickupTimeout = setTimeout(() => {
                isHandlingDate = true;
                try {
                    if (validateDate(this.pickupDateInput)) {
                        // Set minimum return date to day after pickup
                        const minReturn = new Date(this.pickupDateInput.value + 'T00:00:00');
                        minReturn.setDate(minReturn.getDate() + 1);
                        this.returnDateInput.min = minReturn.toISOString().split('T')[0];
                        this.returnDateInput.max = maxDateStr;
                        
                        // Clear return date if it's before new minimum
                        if (this.returnDateInput.value) {
                            const returnDate = new Date(this.returnDateInput.value + 'T00:00:00');
                            if (returnDate <= new Date(this.pickupDateInput.value + 'T00:00:00')) {
                                this.returnDateInput.value = '';
                            }
                        }
                    }
                } finally {
                    isHandlingDate = false;
                }
            }, isSafari ? 100 : 0); // Add a small delay for Safari
        });
    }

    if (this.returnDateInput) {
        this.returnDateInput.min = todayStr;
        this.returnDateInput.max = maxDateStr;
        
        let returnTimeout;
        this.returnDateInput.addEventListener('change', (e) => {
            if (isHandlingDate) return;
            
            // Clear any existing timeout
            if (returnTimeout) {
                clearTimeout(returnTimeout);
            }
            
            // Set a small timeout to debounce the event (especially for Safari)
            returnTimeout = setTimeout(() => {
                isHandlingDate = true;
                try {
                    if (!this.pickupDateInput.value) {
                        alert('Please select a pickup date first.');
                        this.returnDateInput.value = '';
                        return;
                    }
                    
                    if (validateDate(this.returnDateInput)) {
                        const returnDate = new Date(this.returnDateInput.value + 'T00:00:00');
                        const pickupDate = new Date(this.pickupDateInput.value + 'T00:00:00');
                        
                        if (returnDate <= pickupDate) {
                            alert('Return date must be at least one day after pickup date.');
                            this.returnDateInput.value = '';
                        }
                    }
                } finally {
                    isHandlingDate = false;
                }
            }, isSafari ? 100 : 0); // Add a small delay for Safari
        });
    }
}

  setupVehicleDateHandlers() {
    const nextButton = this.quoteResult.querySelector('.next-button');
    const backButton = this.quoteResult.querySelector('.back-button');
    const cancelButton = this.quoteResult.querySelector('.cancel-button');

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        const selectedVehicle = this.quoteResult.querySelector(
          'input[name="vehicleType"]:checked'
        );
        if (!selectedVehicle) {
          alert('Please select a vehicle type.');
          return;
        }

        if (!this.pickupDateInput.value || !this.returnDateInput.value) {
          alert('Please select both pickup and return dates.');
          return;
        }

        const pickupDate = new Date(this.pickupDateInput.value);
        const returnDate = new Date(this.returnDateInput.value);

        if (returnDate <= pickupDate) {
          alert('Return date must be after pickup date.');
          return;
        }

        this.formData.vehicleType = selectedVehicle.value;
        this.formData.pickupDate = this.pickupDateInput.value;
        this.formData.returnDate = this.returnDateInput.value;

        // Reset question index when moving forward from vehicle selection
        this.currentQuestionIndex = -1;
        this.showNextQuestion();
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        this.quoteForm.style.display = 'block';
        this.quoteResult.style.display = 'none';
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        window.location.href = '/quote/';
      });
    }
  }

  validateInitialForm() {
    if (!this.pickupDateInput.value || !this.returnDateInput.value) {
      alert('Please select both pickup and return dates.');
      return false;
    }

    const phoneInput = document.getElementById('phone').value;
    if (!validatePhoneNumber(phoneInput)) {
      alert('Please enter a valid phone number (e.g., 123-456-7890)');
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
      this.quoteResult.innerHTML = this.createQuestionHTML(
        this.questions[this.currentQuestionIndex]
      );
      this.setupQuestionHandlers();
    } else {
      this.showRateOptions();
    }
  }

  showPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.quoteResult.innerHTML = this.createQuestionHTML(
        this.questions[this.currentQuestionIndex]
      );
      this.setupQuestionHandlers();
    } else {
      // Reset form data related to questions when going back to vehicle selection
      this.formData.answers = {};
      this.currentQuestionIndex = -1;
      this.showVehicleDate();
    }
  }

  setupQuestionHandlers() {
    const nextButton = this.quoteResult.querySelector('.next-button');
    const backButton = this.quoteResult.querySelector('.back-button');
    const cancelButton = this.quoteResult.querySelector('.cancel-button');

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        const radioButtons = this.quoteResult.querySelectorAll(
          'input[type="radio"]'
        );
        const selectedAnswer = Array.from(radioButtons).find(
          (radio) => radio.checked
        );

        if (selectedAnswer) {
          const currentQuestion = this.questions[this.currentQuestionIndex];
          this.formData.answers[currentQuestion.name] = selectedAnswer.value;

          if (
            currentQuestion.id === 'age-license' &&
            selectedAnswer.value === 'no'
          ) {
            alert(
              'We do rent to customers under the age of 25, but you must call ' +
                'us directly at 540-213-0202 to set up your rental.'
            );
            window.location.href = '/quote/';
            return;
          }

          this.showNextQuestion();
        } else {
          alert('Please select an answer before continuing.');
        }
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        this.showPreviousQuestion();
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        window.location.href = '/quote/';
      });
    }

    // Restore previous answer if it exists
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (this.formData.answers && this.formData.answers[currentQuestion.name]) {
      const value = this.formData.answers[currentQuestion.name];
      const radio = this.quoteResult.querySelector(
        `input[name="${currentQuestion.name}"][value="${value}"]`
      );
      if (radio) {
        radio.checked = true;
      }
    }
  }

  showRateOptions() {
    const pickupDate = new Date(this.formData.pickupDate);
    const returnDate = new Date(this.formData.returnDate);
    const numDays = Math.ceil(
      (returnDate - pickupDate) / (1000 * 60 * 60 * 24)
    );

    const needsInsurance = this.formData.answers.insurance === 'no';
    const quote100 = calculateQuote(
      this.formData.vehicleType,
      '100',
      needsInsurance,
      numDays
    );
    const quote200 = calculateQuote(
      this.formData.vehicleType,
      '200',
      needsInsurance,
      numDays
    );

    if (!quote200) {
      alert('Unable to calculate rates for the selected vehicle type.');
      return;
    }

    const rateOptionsHTML = this.createRateOptionsHTML(
      quote100,
      quote200,
      numDays
    );
    this.quoteResult.innerHTML = rateOptionsHTML;
    this.setupRateOptionHandlers();
  }

  createRateOptionsHTML(quote100, quote200, numDays) {
    return `
            <h3>Select Your Mileage Package</h3>
            <div class="rate-options-container">
            ${
              quote100
                ? `
            <div class="rate-option" data-mileage="100">
                <h4>100 Mile Package</h4>
                <div class="rate-details">
                    <table class="rate-table">
                        <tr>
                            <td>Daily Rate:</td>
                            <td>$${quote100.base_rate}/day</td>
                        </tr>
                        <tr>
                            <td>Number of Days:</td>
                            <td>${numDays}</td>
                        </tr>
                        <tr>
                            <td>Rental Total:</td>
                            <td>$${(quote100.base_rate * numDays).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Facility Fee:</td>
                            <td>$${quote100.facility_fee.toFixed(2)}</td>
                        </tr>
                        ${
                          this.formData.answers.insurance === 'no'
                            ? `
                        <tr>
                            <td>Insurance:</td>
                            <td>$${quote100.insurance}/day</td>
                        </tr>`
                            : ''
                        }
                        <tr>
                            <td>Tax:</td>
                            <td>$${quote100.tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total:</td>
                            <td>$${quote100.total.toFixed(2)}</td>
                        </tr>
                        <tr class="deposit-row">
                            <td>Required Deposit:</td>
                            <td>$${
                              this.formData.answers.out_of_state === 'yes'
                                ? quote100.deposit.out_of_state
                                : quote100.deposit.in_state
                            }</td>
                        </tr>
                    </table>
                </div>
                <p class="mileage-info">Additional miles beyond the included 100 miles will be charged at $0.20 per mile.</p>
                <button class="select-rate" data-mileage="100">Select 100 Mile Package</button>
            </div>`
                : ''
            }
            <div class="rate-option" data-mileage="200">
                <h4>200 Mile Package</h4>
                <div class="rate-details">
                    <table class="rate-table">
                        <tr>
                            <td>Daily Rate:</td>
                            <td>$${quote200.base_rate}/day</td>
                        </tr>
                        <tr>
                            <td>Number of Days:</td>
                            <td>${numDays}</td>
                        </tr>
                        <tr>
                            <td>Rental Total:</td>
                            <td>$${(quote200.base_rate * numDays).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Facility Fee:</td>
                            <td>$${quote200.facility_fee.toFixed(2)}</td>
                        </tr>
                        ${
                          this.formData.answers.insurance === 'no'
                            ? `
                        <tr>
                            <td>Insurance:</td>
                            <td>$${quote200.insurance}/day</td>
                        </tr>`
                            : ''
                        }
                        <tr>
                            <td>Tax:</td>
                            <td>$${quote200.tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total:</td>
                            <td>$${quote200.total.toFixed(2)}</td>
                        </tr>
                        <tr class="deposit-row">
                            <td>Required Deposit:</td>
                            <td>$${
                              this.formData.answers.out_of_state === 'yes'
                                ? quote200.deposit.out_of_state
                                : quote200.deposit.in_state
                            }</td>
                        </tr>
                    </table>
                </div>
                <p class="mileage-info">Additional miles beyond the included 200 miles will be charged at $0.20 per mile.</p>
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

    rateButtons.forEach((button) => {
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
    const needsInsurance = this.formData.answers.insurance === 'no';
    const quote = calculateQuote(
      this.formData.vehicleType,
      this.formData.selectedMileage,
      needsInsurance
    );

    const deposit =
      this.formData.answers.out_of_state === 'yes'
        ? quote.deposit.out_of_state
        : quote.deposit.in_state;
    const pickupDate = new Date(this.formData.pickupDate);
    const returnDate = new Date(this.formData.returnDate);
    const numDays = Math.ceil(
      (returnDate - pickupDate) / (1000 * 60 * 60 * 24)
    );
    const totalInsurance = needsInsurance ? quote.insurance * numDays : 0;
    const baseTotal = quote.base_rate * numDays;
    const totalBeforeTax = baseTotal + totalInsurance + quote.facility_fee;
    const tax =
      totalBeforeTax * RENTAL_RATES[this.formData.vehicleType].tax_rate; // Recalculate tax
    const totalDailyRate = totalBeforeTax + tax;
    const totalRequired = deposit + totalDailyRate;

    // Format dates
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const emailData = {
      first_name: this.formData.firstName,
      last_name: this.formData.lastName,
      email: this.formData.email,
      phone: this.formData.phone,
      vehicle_type: this.formData.vehicleType
        .replace('small', 'Small Car')
        .replace('midsize', 'Mid-Size Car')
        .replace('fullsize', 'Full-Size Car')
        .replace('minivan', 'Minivan')
        .replace('passenger-van', 'Passenger Van'),
      pickup_date: pickupDate.toLocaleDateString('en-US', dateOptions),
      return_date: returnDate.toLocaleDateString('en-US', dateOptions),
      age_license: this.formData.answers.age_license === 'yes' ? 'Yes' : 'No',
      insurance: this.formData.answers.insurance === 'yes' ? 'Yes' : 'No',
      out_of_state:
        this.formData.answers.out_of_state === 'yes' ? 'Yes' : 'No',
      mileage_package: this.formData.selectedMileage,
      daily_rate: quote.base_rate.toFixed(2),
      total_daily_rate: totalDailyRate.toFixed(2),
      insurance_daily_rate: needsInsurance ? quote.insurance.toFixed(2) : '0.00',
      total_insurance: totalInsurance.toFixed(2),
      facility_fee: quote.facility_fee.toFixed(2),
      tax: tax.toFixed(2),
      deposit: deposit.toFixed(2),
      total_required: totalRequired.toFixed(2),
      number_of_days: numDays,
    };

    Promise.all([
      emailjs.send('service_b8f7bys', 'customer_quote', emailData),
      emailjs.send('service_b8f7bys', 'internal_quote', emailData),
    ])
      .then(() => this.showThankYouMessage())
      .catch((error) => {
        console.error('Email sending failed:', error);
        this.showErrorMessage();
      });
  }

  showThankYouMessage() {
    this.quoteResult.innerHTML = `
            <h3>Thank You For Submitting a Rental Quote. We Will be in Touch With You Shortly.</h3>
            <p class="contact-info">If you have any further questions, please contact us by phone call or text message at 540-213-0202 or by email at rental@cawcaw.com.</p>
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
