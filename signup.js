//signup.js


console.log("Signup script loaded");

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const signupPrompt = document.getElementById('signup-prompt');

    // Hide the signup prompt initially
    signupPrompt.style.display = 'none';

    // Event listener for sign-up form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Send username and password to server for sign-up
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to login page after successful sign-up
                window.location.href = 'index.html';
            } else {
                // Display the signup prompt if sign-up fails
                signupPrompt.textContent = data.message;
                signupPrompt.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });
});
