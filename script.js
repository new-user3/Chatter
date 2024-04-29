// script.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const chatContainer = document.getElementById('chat-container');
    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    let username = '';

    // WebSocket connection
    //   for local host -  const socket = new WebSocket('ws://localhost:8080');
    const socket = new WebSocket('wss://chatter-1.onrender.com:8080/');



    socket.addEventListener('open', () => {
        console.log('Connected to server');
    });

    socket.addEventListener('message', (event) => {
        // Display received message in the message container
        displayMessage(event.data);
    });

    function sendMessage(message) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function handleLoginSuccess() {
        // Display the chat interface after successful login
        document.getElementById('login-container').style.display = 'none';
        chatContainer.style.display = 'block';
        username = document.getElementById('username').value.trim(); // Store the username
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const enteredUsername = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Send username and password to server for authentication
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: enteredUsername, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                handleLoginSuccess();
            } else {
                alert('Login failed. Invalid username or password.');
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            alert('An error occurred. Please try again later.');
        });
    });

    // Event listener for sending a message when send button is clicked
    document.getElementById('send-button').addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message !== '') {
            // Send message to server
            sendMessage(`${username}: ${message}`);
            messageInput.value = ''; // Clear the message input field
        }
    });

    // Event listener for sending a message when Enter key is pressed
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const message = messageInput.value.trim();
            if (message !== '') {
                // Send message to server
                sendMessage(`${username}: ${message}`);
                messageInput.value = ''; // Clear the message input field
            }
        }
    });
});
