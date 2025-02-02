// server.js
const express = require('express');
const app = express();
const port = 3000;

// Serving static files (HTML, CSS, JS)
app.use(express.static('public'));

// Defining a route for handling client communication
app.get('/api/message', (req, res) => {
    const message = 'Hello Geek. This Message is From Server';
    res.json({ message });
});

app.get('/api/poll', (req, res) => {
	console.log(req);
    const message = 'Hello Geek. This Message is From Server';
    res.json({ message });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

