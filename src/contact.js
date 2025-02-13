// Initialize EmailJS
try {
    emailjs.init('Ij6nI-ZNRp56im9-x');
    console.log('EmailJS initialized successfully');
} catch (error) {
    console.error('EmailJS initialization failed:', error);
}

// Phone number validation utility
function validatePhoneNumber(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

// Handle contact form submission
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!validatePhoneNumber(phone)) {
                alert('Please enter a valid phone number (e.g., 123-456-7890)');
                return;
            }

            const emailData = {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                message: message
            };

            Promise.all([
                emailjs.send('service_b8f7bys', 'customer_contact', emailData),
                emailjs.send('service_b8f7bys', 'internal_contact', emailData)
            ])
            .then(() => {
                const formContainer = contactForm.parentElement;
                formContainer.innerHTML = `
                    <h3>Thank You For Contacting Us</h3>
                    <p class="contact-info">We have received your message and will be in touch with you soon. You will receive an email confirmation of your contact submission.</p>
                    <p class="contact-info">If you don't hear back from us within 24 hours, please feel free to call or text us at 540-213-0202 or email us at rental@cawcaw.com.</p>
                `;
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                alert('An error occurred while sending your message. Please try again or contact us directly at 540-213-0202.');
            });
        });
    }
});