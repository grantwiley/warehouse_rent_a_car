function isSunday(date) {
    const selectedDate = new Date(date);
    return selectedDate.getDay() === 0;
}

function validateDate(dateInput) {
    if (isSunday(dateInput.value)) {
        alert('We are closed on Sundays. Please select another day.');
        dateInput.value = '';
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    if (!hamburger || !nav) {
        console.error('Hamburger or nav elements not found');
        return;
    }

    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
        console.log('Menu clicked, nav classes:', nav.classList);
    });

    // Quote Form Handling
    const quoteForm = document.getElementById('quote-form');
    const quoteResult = document.getElementById('quote-result');
    
    // Initialize form data storage
    let formData = {};

    const pickupDateInput = document.getElementById('pickup-date');
    const returnDateInput = document.getElementById('return-date');

    pickupDateInput.addEventListener('change', function() {
        validateDate(this);
    });

    returnDateInput.addEventListener('change', function() {
        validateDate(this);
    });

    if (quoteForm && quoteResult) {
        const questions = [
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

        let currentQuestionIndex = -1;

        function createQuestionHTML(question) {
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

        function showRateOptions() {
            const quote100 = calculateQuote(formData.vehicleType, '100', formData.answers.insurance);
            const quote200 = calculateQuote(formData.vehicleType, '200', formData.answers.insurance);

            if (!quote200) {
                alert('Unable to calculate rates for the selected vehicle type.');
                return;
            }

            const rateOptionsHTML = `
                <h3>Select Your Mileage Package</h3>
                ${quote100 ? `
                <div class="rate-option" data-mileage="100">
                    <h4>100 Mile Package - $${quote100.base_rate}/day</h4>
                    <p>Base Rate: $${quote100.base_rate}</p>
                    <p>Facility Fee: $${quote100.facility_fee}</p>
                    ${quote100.insurance ? `<p>Insurance: $${quote100.insurance}</p>` : ''}
                    <p>Tax: $${quote100.tax.toFixed(2)}</p>
                    <p class="total">Total: $${quote100.total}/day</p>
                    <p class="deposit">Required Deposit: $${formData.answers.out_of_state === 'yes' ? quote100.deposit.out_of_state : quote100.deposit.in_state}</p>
                    <button class="select-rate" data-mileage="100">Select 100 Mile Package</button>
                </div>` : ''}
                <div class="rate-option" data-mileage="200">
                    <h4>200 Mile Package - $${quote200.base_rate}/day</h4>
                    <p>Base Rate: $${quote200.base_rate}</p>
                    <p>Facility Fee: $${quote200.facility_fee}</p>
                    ${quote200.insurance ? `<p>Insurance: $${quote200.insurance}</p>` : ''}
                    <p>Tax: $${quote200.tax.toFixed(2)}</p>
                    <p class="total">Total: $${quote200.total}/day</p>
                    <p class="deposit">Required Deposit: $${formData.answers.out_of_state === 'yes' ? quote200.deposit.out_of_state : quote200.deposit.in_state}</p>
                    <button class="select-rate" data-mileage="200">Select 200 Mile Package</button>
                </div>
                <div class="button-group">
                    <button type="button" class="back-button">Back</button>
                    <button type="button" class="cancel-button">Cancel</button>
                </div>
            `;

            quoteResult.innerHTML = rateOptionsHTML;
            setupRateOptionHandlers();
        }

        function setupRateOptionHandlers() {
            const rateButtons = quoteResult.querySelectorAll('.select-rate');
            const backButton = quoteResult.querySelector('.back-button');
            const cancelButton = quoteResult.querySelector('.cancel-button');

            rateButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const mileage = e.target.dataset.mileage;
                    formData.selectedMileage = mileage;
                    sendEmail();
                });
            });

            if (backButton) {
                backButton.addEventListener('click', showPreviousQuestion);
            }

            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    window.location.href = 'quote.html';
                });
            }
        }

        function sendEmail() {
            console.log('Sending email with form data:', formData);
            const quote = calculateQuote(formData.vehicleType, formData.selectedMileage, formData.answers.insurance);
            
            emailjs.send('service_b8f7bys', 'template_p0lem5c', {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                vehicle_type: formData.vehicleType,
                pickup_date: formData.pickupDate,
                return_date: formData.returnDate,
                age_license: formData.answers.age_license,
                insurance: formData.answers.insurance,
                out_of_state: formData.answers.out_of_state,
                mileage_package: formData.selectedMileage,
                daily_rate: quote.base_rate,
                facility_fee: quote.facility_fee,
                insurance_fee: quote.insurance,
                tax: quote.tax.toFixed(2),
                total_daily_rate: quote.total,
                deposit: formData.answers.out_of_state === 'yes' ? quote.deposit.out_of_state : quote.deposit.in_state
            })
            .then((response) => {
                console.log('Email sent successfully:', response);
                showThankYouMessage();
            })
            .catch((error) => {
                console.error('Email sending failed - Details:', {
                    error: error,
                    formData: formData,
                    serviceId: 'service_b8f7bys',
                    templateId: 'template_p0lem5c'
                });
                quoteResult.innerHTML = `
                    <h3>An error occurred while submitting your quote.</h3>
                    <p class="contact-info">Please try again or contact us directly at 540-213-0202.</p>
                `;
            });
        }

        function showThankYouMessage() {
            quoteResult.innerHTML = `
                <h3>Thank You For Submitting a Rental Quote. We Will be in Touch With You Asap.</h3>
                <p class="contact-info">Warehouse Rent a Car is currently updating rates. If you have any further questions, please contact us by phone call or text message at 540-213-0202 or by email at rental@cawcaw.com.</p>
            `;
        }

        function showNextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                quoteForm.style.display = 'none';
                quoteResult.style.display = 'block';
                quoteResult.innerHTML = createQuestionHTML(questions[currentQuestionIndex]);
                setupQuestionHandlers();
                // Add fade effect
                quoteResult.style.opacity = '0';
                setTimeout(() => {
                    quoteResult.style.opacity = '1';
                }, 50);
            } else {
                showRateOptions();
            }
        }

        function showPreviousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                quoteResult.innerHTML = createQuestionHTML(questions[currentQuestionIndex]);
                setupQuestionHandlers();
            } else {
                quoteForm.style.display = 'block';
                quoteResult.style.display = 'none';
                currentQuestionIndex = -1;
            }
        }

        function setupQuestionHandlers() {
            const nextButton = quoteResult.querySelector('.next-button');
            const backButton = quoteResult.querySelector('.back-button');
            const cancelButton = quoteResult.querySelector('.cancel-button');

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    const radioButtons = quoteResult.querySelectorAll('input[type="radio"]');
                    const isAnswered = Array.from(radioButtons).some(radio => radio.checked);
                    if (isAnswered) {
                        // Store the answer before moving to next question
                        const selectedAnswer = Array.from(radioButtons).find(radio => radio.checked);
                        formData.answers[questions[currentQuestionIndex].name] = selectedAnswer.value;
                        showNextQuestion();
                    } else {
                        alert('Please select an answer before continuing.');
                    }
                });
            }

            if (backButton) {
                backButton.addEventListener('click', showPreviousQuestion);
            }

            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    window.location.href = 'quote.html';
                });
            }
        }

        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const pickupDate = document.getElementById('pickup-date').value;
            const returnDate = document.getElementById('return-date').value;
            
            if (isSunday(pickupDate) || isSunday(returnDate)) {
                alert('We are closed on Sundays. Please select another day.');
                return;
            }
            
            // Collect initial form data
            formData = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                vehicleType: document.getElementById('vehicle-type').value,
                pickupDate: pickupDate,
                returnDate: returnDate,
                answers: {}
            };
            currentQuestionIndex = -1;
            showNextQuestion();
        });
    }
});