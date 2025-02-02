// server.js
const express = require('express');
const app = express();
const port = 3000;

// Global persistent data.
const gUserData = [
	{
		name: 'Alex',
		score: 1000,
		colour: '#FF0000FF',
	},
	{
		name: 'Tom',
		score: 1000,
		colour: '#FF0000FF',
	},
];

const gGuesses = []

// Whose turn is it.
let gCurrentPlayer = -1;

let gCurrentTint = '';

function clearGuesses()
{
	gGuesses.splice(0, gGuesses.length);
}

function getPlayerByName(name)
{
	for (const i in gUserData)
	{
		if (gUserData[i].name === name)
		{
			return +i;
		}
	}
}

const
	gRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
	gCols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function nextTurn()
{
	clearGuesses();
	gCurrentPlayer = (gCurrentPlayer + 1) % gUserData.length;
	gCurrentTint = gRows[Math.floor(Math.random() * gRows.length)] + gCols[Math.floor(Math.random() * gCols.length)];
}

function getState(name)
{
	const id = getPlayerByName(name);
	return {
		guesses: gGuesses,
		current: gCurrentPlayer,
		id,
		others: gUserData,
		tint: (id === gCurrentPlayer) ? gCurrentTint : '',
	};
}

// Serving static files (HTML, CSS, JS)
app.use(express.static('public'));

// Repeatedly get the current server state.
app.get('/api/poll', (req, res) => {
	const { name } = req.query;
	res.json(getState(name));
});

app.get('/api/start', (req, res) => {
	const { user } = req.query;
	for (const i of gUserData)
	{
		i.score = 0;
	}
	gCurrentPlayer = Math.floor(Math.random() * gUserData.length);
	res.json({ });
	nextTurn();
});

app.get('/api/guess', (req, res) => {
	const { name, guess } = req.query;
	const id = getPlayerByName(name);
	if (id == null)
	{
		res.json({ failed: 'Could not find player.' });
	}
	else if (id === gCurrentPlayer)
	{
		res.json({ failed: 'You cannot guess now.' });
	}
	else
	{
		res.json(getState(name));
	}
});

app.get('/api/add-player', (req, res) => {
	const { name, colour } = req.query;
	if (name == null)
	{
		res.json({ failed: 'No name given.' });
	}
	else if (colour == null)
	{
		res.json({ failed: 'No colour given.' });
	}
	else if (getPlayerByName(name) != null)
	{
		res.json({ failed: 'Player already exists.' });
	}
	else
	{
		const id = gUserData.length;
		gUserData.push({ name, colour, score: 0 });
		res.json(getState(name));
	}
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

