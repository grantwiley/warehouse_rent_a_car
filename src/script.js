// Global variable to prevent multiple date handling
let isHandlingDate = false;

// Mobile Navigation Improvements
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const header = document.querySelector('.header');
const body = document.querySelector('body');

if (hamburger && nav) {
  // Add accessibility attributes
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('role', 'button');
  hamburger.setAttribute('tabindex', '0');
  
  // Add hamburger icon markup if not present
  if (hamburger.childElementCount === 0) {
    hamburger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
  }

  // Handle both click and keyboard events for accessibility
  hamburger.addEventListener('click', toggleMenu);
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !hamburger.contains(e.target)) {
      toggleMenu();
    }
  });

  // Close menu when pressing escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      toggleMenu();
    }
  });
  
  // Handle nav link clicks (close menu on mobile when nav link is clicked)
  const navLinks = nav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && nav.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

function toggleMenu() {
  nav.classList.toggle('active');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', nav.classList.contains('active'));
  
  // Lock body scroll when menu is open
  if (nav.classList.contains('active')) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
}

// Floating header functionality
let lastScroll = 0;
let scrollTimer = null;
const scrollThreshold = 5; // Minimum scroll amount to trigger header behavior

window.addEventListener('scroll', () => {
  // Throttle scroll events
  if (scrollTimer === null) {
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      
      const currentScroll = window.pageYOffset;
      
      // Always show header at the very top of the page
      if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        header.classList.remove('scroll-down');
        return;
      }
      
      // Only react to significant scroll amounts
      if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;
      
      // Hide header when scrolling down
      if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
      } 
      // Show header when scrolling up
      else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
      }
      
      lastScroll = currentScroll;
    }, 50);
  }
});

// Touch event handling
let touchStartY = 0;
const touchThreshold = 10;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (scrollTimer === null) {
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      
      const currentY = e.touches[0].clientY;
      const diff = touchStartY - currentY;
      
      // Only react to significant touch movements
      if (Math.abs(diff) < touchThreshold) return;
      
      // Hide header when scrolling down with touch
      if (diff > 0 && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
      } 
      // Show header when scrolling up with touch
      else if (diff < 0 && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
      }
      
      touchStartY = currentY;
    }, 50);
  }
}, { passive: true });

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

// EmailJS initialization is now handled server-side

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
        text: 'Do all renters carry full coverage automobile insurance with comprehensive and collision deductibles no higher than $500?',
        name: 'insurance',
      },
      {
        id: 'liability-insurance',
        text: 'Do all renters carry liability insurance?',
        name: 'liability_insurance',
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

  scrollToTop() {
    // Get the form's position relative to the viewport
    const formElement = this.quoteResult || this.quoteForm;
    if (formElement) {
      const formRect = formElement.getBoundingClientRect();
      const absoluteFormTop = window.pageYOffset + formRect.top;
      
      // Add a small offset (e.g., 20px) to give some breathing room at the top
      const offset = 20;
      
      window.scrollTo({
        top: absoluteFormTop - offset,
        behavior: 'smooth'
      });
    }
  }

  showVehicleDate() {
    this.quoteForm.style.display = 'none';
    this.quoteResult.style.display = 'block';
    this.quoteResult.innerHTML = this.createVehicleDateHTML();
    this.setupVehicleDateHandlers();
    this.setupDateInputs();
    this.scrollToTop(); // Keep this only for the vehicle/date screen
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
                    }
                } finally {
                    isHandlingDate = false;
                }
            }, isSafari ? 100 : 0);
        });
    }

    if (this.returnDateInput) {
        this.returnDateInput.min = todayStr;
        this.returnDateInput.max = maxDateStr;
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

        // Validate dates when continue button is clicked
        const pickupDate = new Date(this.pickupDateInput.value + 'T00:00:00');
        const returnDate = new Date(this.returnDateInput.value + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if pickup date is a Sunday
        if (pickupDate.getDay() === 0) {
          alert('We are closed on Sundays. Please select another pickup date.');
          this.pickupDateInput.value = '';
          return;
        }

        // Check if return date is a Sunday
        if (returnDate.getDay() === 0) {
          alert('We are closed on Sundays. Please select another return date.');
          this.returnDateInput.value = '';
          return;
        }

        // Check if pickup date is in the past
        if (pickupDate < today) {
          alert('Please select a future pickup date.');
          this.pickupDateInput.value = '';
          return;
        }

        // Check if return date is before pickup date
        if (returnDate <= pickupDate) {
          alert('Return date must be at least one day after pickup date.');
          this.returnDateInput.value = '';
          return;
        }

        // Calculate 3 months from today
        const threeMonthsFromNow = new Date(today);
        threeMonthsFromNow.setMonth(today.getMonth() + 3);

        // Check if dates are more than 3 months away
        if (pickupDate > threeMonthsFromNow || returnDate > threeMonthsFromNow) {
          alert('Bookings cannot be made more than 3 months in advance. Please select closer dates.');
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
      // scrollToTop() removed from here
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
      this.scrollToTop();
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

          // Handle age-license question
          if (currentQuestion.id === 'age-license' && selectedAnswer.value === 'no') {
            alert(
              'We do rent to customers under the age of 25, but you must call ' +
              'us directly at 540-213-0202 to set up your rental.'
            );
            window.location.href = '/quote/';
            return;
          }

          // Handle insurance questions
          if (currentQuestion.id === 'insurance') {
            if (selectedAnswer.value === 'no') {
              // Show liability insurance question next
              this.showNextQuestion();
            } else {
              // If they have full coverage, automatically set liability to yes and skip the question
              this.formData.answers['liability_insurance'] = 'yes';
              this.currentQuestionIndex++; // Skip liability question
              this.showNextQuestion();
            }
            return;
          }

          // Handle liability insurance question
          if (currentQuestion.id === 'liability-insurance' && selectedAnswer.value === 'no') {
            alert(
              'We apologize, but we cannot rent to customers without liability insurance. ' +
              'Please call us at 540-213-0202 if you have any questions.'
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

    // Need insurance if no full coverage but has liability
    const needsInsurance = 
      this.formData.answers.insurance === 'no' && 
      this.formData.answers.liability_insurance === 'yes';

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
    this.scrollToTop();
  }

  createRateOptionsHTML(quote100, quote200, numDays) {
    const pickupDate = new Date(this.formData.pickupDate + 'T00:00:00-05:00');
    const returnDate = new Date(this.formData.returnDate + 'T00:00:00-05:00');
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const needsInsurance = this.formData.answers.insurance === 'no' && 
                          this.formData.answers.liability_insurance === 'yes';

    return `
            <h3>Select Your Mileage Package</h3>
            <div class="rental-dates">
                <p>Pickup Date: ${pickupDate.toLocaleDateString('en-US', dateOptions)}</p>
                <p>Return Date: ${returnDate.toLocaleDateString('en-US', dateOptions)}</p>
            </div>
            <div class="rate-options-container">
            ${
              quote100
                ? `
            <div class="rate-option" data-mileage="100">
                <h4>100 Mile Package</h4>
                <div class="rate-details">
                    <table class="rate-table">
                        <tbody>
                            <tr>
                                <td>Package Selected:</td>
                                <td>100 Mile Package</td>
                            </tr>
                            <tr>
                                <td>Free Miles:</td>
                                <td>${100 * numDays}</td>
                            </tr>
                            <tr>
                                <td>Rental Rate:</td>
                                <td>$${(quote100.base_rate * numDays).toFixed(2)}</td>
                            </tr>
                            ${
                              needsInsurance
                                ? `
                            <tr>
                                <td>Insurance Total:</td>
                                <td>$${(quote100.insurance * numDays).toFixed(2)}</td>
                            </tr>`
                                : ''
                            }
                            <tr>
                                <td>Facility Charge:</td>
                                <td>$${quote100.facility_fee.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax:</td>
                                <td>$${quote100.tax.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Car Rental Total:</td>
                                <td>$${quote100.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Deposit Required:</td>
                                <td>$${
                                  this.formData.answers.out_of_state === 'yes'
                                    ? quote100.deposit.out_of_state
                                    : quote100.deposit.in_state
                                }</td>
                            </tr>
                            <tr class="total-row">
                                <td>Total Required at Time of Rental:</td>
                                <td>$${(quote100.total + (this.formData.answers.out_of_state === 'yes'
                                    ? quote100.deposit.out_of_state
                                    : quote100.deposit.in_state)).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="mileage-info">Additional miles beyond the included ${100 * numDays} miles will be charged at $0.20 per mile.</p>
                <button class="select-rate" data-mileage="100">Select 100 Mile Package</button>
            </div>`
                : ''
            }
            <div class="rate-option" data-mileage="200">
                <h4>200 Mile Package</h4>
                <div class="rate-details">
                    <table class="rate-table">
                        <tr>
                            <td>Package Selected:</td>
                            <td>200 Mile Package</td>
                        </tr>
                        <tr>
                            <td>Free Miles:</td>
                            <td>${200 * numDays}</td>
                        </tr>
                        <tr>
                            <td>Rental Rate:</td>
                            <td>$${(quote200.base_rate * numDays).toFixed(2)}</td>
                        </tr>
                        ${
                          needsInsurance
                            ? `
                        <tr>
                            <td>Insurance Total:</td>
                            <td>$${(quote200.insurance * numDays).toFixed(2)}</td>
                        </tr>`
                            : ''
                        }
                        <tr>
                            <td>Facility Charge:</td>
                            <td>$${quote200.facility_fee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax:</td>
                            <td>$${quote200.tax.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Car Rental Total:</td>
                            <td>$${quote200.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Deposit Required:</td>
                            <td>$${
                              this.formData.answers.out_of_state === 'yes'
                                ? quote200.deposit.out_of_state
                                : quote200.deposit.in_state
                            }</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total Required at Time of Rental:</td>
                            <td>$${(quote200.total + (this.formData.answers.out_of_state === 'yes'
                                ? quote200.deposit.out_of_state
                                : quote200.deposit.in_state)).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                <p class="mileage-info">Additional miles beyond the included ${200 * numDays} miles will be charged at $0.20 per mile.</p>
                <button class="select-rate" data-mileage="200">Select 200 Mile Package</button>
            </div>
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
    const needsInsurance = 
      this.formData.answers.insurance === 'no' && 
      this.formData.answers.liability_insurance === 'yes';

    const quote = calculateQuote(
      this.formData.vehicleType,
      this.formData.selectedMileage,
      needsInsurance
    );

    const deposit =
      this.formData.answers.out_of_state === 'yes'
        ? quote.deposit.out_of_state
        : quote.deposit.in_state;

    const pickupDate = new Date(this.formData.pickupDate + 'T00:00:00-05:00'); // Eastern timezone
    const returnDate = new Date(this.formData.returnDate + 'T00:00:00-05:00');
    const numDays = Math.ceil(
      (returnDate - pickupDate) / (1000 * 60 * 60 * 24)
    );
    const totalInsurance = needsInsurance ? quote.insurance * numDays : 0;
    const totalRentalRate = quote.base_rate * numDays;
    const totalBeforeTax = totalRentalRate + totalInsurance + quote.facility_fee;
    const tax = totalBeforeTax * RENTAL_RATES[this.formData.vehicleType].tax_rate;
    const totalRental = totalBeforeTax + tax;
    const totalRequired = deposit + totalRental;

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
      liability_insurance: this.formData.answers.liability_insurance === 'yes' ? 'Yes' : 'No',
      out_of_state: this.formData.answers.out_of_state === 'yes' ? 'Yes' : 'No',
      mileage_package: this.formData.selectedMileage,
      number_of_days: numDays,
      total_free_miles: this.formData.selectedMileage * numDays,
      total_rental_rate: totalRentalRate.toFixed(2),
      show_insurance: needsInsurance,
      total_insurance: totalInsurance.toFixed(2),
      facility_fee: quote.facility_fee.toFixed(2),
      tax: tax.toFixed(2),
      total_rental: totalRental.toFixed(2),
      deposit: deposit.toFixed(2),
      total_required: totalRequired.toFixed(2)
    };

    // Get service ID from the form element, which will be populated at build time
    const serviceId = document.getElementById('quote-form').dataset.serviceId;
    
    Promise.all([
      emailjs.send(serviceId, 'customer_quote', emailData),
      emailjs.send(serviceId, 'internal_quote', emailData)
    ])
      .then(() => this.showThankYouMessage())
      .catch((error) => {
        console.error('Email sending failed:', error);
        this.showErrorMessage();
      });
  }

  showThankYouMessage() {
    this.quoteResult.innerHTML = `
        <div class="thank-you-message">
            <h3>Thank You For Submitting a Rental Quote. We Will be in Touch With You Shortly.</h3>
            <p class="contact-info">If you have any further questions, please contact us by phone call or text message at 540-213-0202 or by email at rental@cawcaw.com.</p>
        </div>
    `;
    this.scrollToTop();
  }

  showErrorMessage() {
    this.quoteResult.innerHTML = `
            <h3>An error occurred while submitting your quote.</h3>
            <p class="contact-info">Please try again or contact us directly at 540-213-0202.</p>
        `;
    this.scrollToTop();
  }
}

// Modal functionality for service closure
function initializeClosureModal() {
  const modal = document.getElementById('closure-modal');
  const closeBtn = document.querySelector('.modal-close-btn');
  
  if (!modal) return;
  
  // Check if we're on quote or contact page
  const currentPath = window.location.pathname;
  const isQuotePage = currentPath === '/quote/' || currentPath === '/quote';
  const isContactPage = currentPath === '/contact/' || currentPath === '/contact';
  
  if (isQuotePage || isContactPage) {
    // Show modal
    modal.classList.remove('hidden');
  }
  
  // Close modal on button click
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
  
  // Close modal when clicking outside the modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  });
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeClosureModal();
  new RentalQuoteForm();
});
