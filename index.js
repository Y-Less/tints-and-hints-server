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

// List of guesses, in the order that they were made.  The guesses include an offset from the top-
// left corner of the square, but this is purely for display purposes and does not contribute to the
// score (yet, I did consider it - we can have very precise distance calculations for scores).
const g1stGuesses = []; // ({ name: string; guess: string; x: number; y: number; })[]
const g2ndGuesses = []; // ({ name: string; guess: string; x: number; y: number; })[]

// Whose turn is it.
let gCurrentPlayer = -1;

// The colour the current player is trying to describe.
let gCurrentTint = '';

function clearGuesses()
{
	// Empty the array.  Don't reset it (but why?)
	g1stGuesses.splice(0, g1stGuesses.length);
	g2ndGuesses.splice(0, g2ndGuesses.length);
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
	GRID = {
		A: ['AAFFAA', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
		B: ['ACFFAC', 'FAFDFE', 'FAFDFA', 'F4F4FF', 'F9FFFF', 'F9FDFA', 'FFF4FF'],
		C: ['AEFFAE', 'F6FBFE', 'F6FBF6', 'EAEAFF', 'F3FFFF', 'F4FBF5', 'FFEAFF'],
		D: ['B1FFB1', 'F2FAFD', 'F1F9F2', 'E0E0FF', 'EEFFFF', 'EFF9F0', 'FFE0FF'],
		E: ['B3FFB3', 'EDF8FD', 'EDF8EE', 'D6D6FF', 'E8FFFF', 'EAF7EB', 'FFD6FF'],
		F: ['B5FFB5', 'E9F7FC', 'E8F6EA', 'CCCCFF', 'E2FFFF', 'E4F5E7', 'FFCCFF'],
		G: ['B7FFB7', 'E5F5FC', 'E4F4E6', 'C1C1FF', 'DDFFFF', 'DFF3E2', 'FFC1FF'],
		H: ['B9FFB9', 'E0F4FB', 'DFF3E2', 'B7B7FF', 'D7FFFF', 'DAF1DD', 'FFB7FF'],
		I: ['BBFFBB', 'DCF2FB', 'DBF1DE', 'ADADFF', 'D1FFFF', 'D5EFD8', 'FFADFF'],
		J: ['BDFFBD', 'D8F1FA', 'D6EFD9', 'A3A3FF', 'CCFFFF', 'D0EDD4', 'FFA3FF'],
		K: ['C0FFC0', 'D3EFFA', 'D2EED5', '9999FF', 'C6FFFF', 'CAEBCF', 'FF99FF'],
		L: ['C2FFC2', 'CFEEFA', 'CDECD1', '8E8EFF', 'C0FFFF', 'C5E9CA', 'FF8EFF'],
		M: ['C4FFC4', 'CBECF9', 'C9EACD', '8484FF', 'BBFFFF', 'C0E7C5', 'FF84FF'],
		N: ['C6FFC6', 'C7EBF9', 'C4E9C9', '7A7AFF', 'B5FFFF', 'BBE5C1', 'FF7AFF'],
		O: ['C8FFC8', 'C2E9F8', 'C0E7C5', '7070FF', 'AFFFFF', 'B6E3BC', 'FF70FF'],
		P: ['CAFFCA', 'BEE8F8', 'BBE5C1', '6666FF', 'AAFFFF', 'B0E1B7', 'FF66FF'],
		Q: ['CCFFCC', 'BAE6F7', 'B7E4BD', '5B5BFF', 'A4FFFF', 'ABDFB2', 'FF5BFF'],
		R: ['CEFFCE', 'B5E5F7', 'B2E2B9', '5151FF', '9EFFFF', 'A6DDAE', 'FF51FF'],
		S: ['D1FFD1', 'B1E3F6', 'AEE0B4', '4747FF', '99FFFF', 'A1DBA9', 'FF47FF'],
		T: ['D3FFD3', 'ADE2F6', 'A9DFB0', '3D3DFF', '93FFFF', '9CDAA4', 'FF3DFF'],
		U: ['D5FFD5', 'A8E0F6', 'A5DDAC', '3333FF', '8DFFFF', '96D89F', 'FF33FF'],
		V: ['D7FFD7', 'A4DFF5', 'A0DBA8', '2828FF', '88FFFF', '91D69A', 'FF28FF'],
		W: ['D9FFD9', 'A0DDF5', '9CDAA4', '1E1EFF', '82FFFF', '8CD496', 'FF1EFF'],
		X: ['DBFFDB', '9BDCF4', '97D8A0', '1414FF', '7CFFFF', '87D291', 'FF14FF'],
		Y: ['DDFFDD', '97DAF4', '93D69C', '0A0AFF', '77FFFF', '81D08C', 'FF0AFF'],
		Z: ['E0FFE0', '93D9F3', '8ED498', '0000FF', '71FFFF', '7CCE87', 'FF00FF'],
	},
	COLS = Object.keys(GRID),
	ROWS = Object.keys(GRID.A);

function nextTurn()
{
	// Parse the guesses and update people's scores.
	clearGuesses();
	gCurrentPlayer = (gCurrentPlayer + 1) % gUserData.length;
	gCurrentTint = ROWS[Math.floor(Math.random() * ROWS.length)] + COLS[Math.floor(Math.random() * COLS.length)];
}

function getState(name)
{
	const id = getPlayerByName(name);
	return {
		first: g1stGuesses,
		second: (g1stGuesses.length === gUserData.length - 1) ? g2ndGuesses : void 0,
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
	nextTurn();
	for (const i of gUserData)
	{
		i.score = 0;
	}
	gCurrentPlayer = Math.floor(Math.random() * gUserData.length);
	res.json({ });
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
	else if (guess == null)
	{
		res.json({ failed: 'No guess provided.' });
	}
	else if (g2ndGuesses.length === gUserData.length - 1)
	{
		// All but one player (the hinter) have guessed twice.
		res.json({ failed: 'Guessing is complete.' });
	}
	else
	{
		const first = g1stGuesses.length < gUserData.length - 1;
		const iter = first ? g1stGuesses : g2ndGuesses;
		// All but one player (the hinter) have guessed once.
		for (const i of iter)
		{
			if (i.name === name)
			{
				res.json({ failed: 'Please wait for others to guess.' });
				return;
			}
		}
		iter.push({
			name,
			guess,
			x: 0,
			y: 0,
			colour: gUserData[id].colour,
			first,
		});
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

