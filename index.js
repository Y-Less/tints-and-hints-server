const express = require('express');
const app = express();

const PORT = 3000;

// Global persistent data.
const gUserData = [];

// List of guesses, in the order that they were made.  The guesses include an offset from the top-
// left corner of the square, but this is purely for display purposes and does not contribute to the
// score (yet, I did consider it - we can have very precise distance calculations for scores).
let g1stGuesses = []; // ({ name: string; guess: string; x: number; y: number; })[]
let g2ndGuesses = null; // ({ name: string; guess: string; x: number; y: number; })[]

// Whose turn is it.
let gCurrentPlayer = -1;

// The colour the current player is trying to describe.
let gCurrentTint = '';

function clearGuesses()
{
	// Empty the array.  Don't reset it (but why?)
	g1stGuesses = [];
	g2ndGuesses = null;
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
		A: [ 'hsl(  0deg   25%   30%)', 'hsl(  0deg   50%   30%)', 'hsl(  0deg   75%   30%)', 'hsl(  0deg  100%   30%)', 'hsl(  0deg  100%   40%)', 'hsl(  0deg  100%   50%)', 'hsl(  0deg  100%   60%)', 'hsl(  0deg  100%   70%)', 'hsl(  0deg  100%   80%)', 'hsl(  0deg  100%   90%)' ],
		B: [ 'hsl( 15deg   25%   30%)', 'hsl( 15deg   50%   30%)', 'hsl( 15deg   75%   30%)', 'hsl( 15deg  100%   30%)', 'hsl( 15deg  100%   40%)', 'hsl( 15deg  100%   50%)', 'hsl( 15deg  100%   60%)', 'hsl( 15deg  100%   70%)', 'hsl( 15deg  100%   80%)', 'hsl( 15deg  100%   90%)' ],
		C: [ 'hsl( 30deg   25%   30%)', 'hsl( 30deg   50%   30%)', 'hsl( 30deg   75%   30%)', 'hsl( 30deg  100%   30%)', 'hsl( 30deg  100%   40%)', 'hsl( 30deg  100%   50%)', 'hsl( 30deg  100%   60%)', 'hsl( 30deg  100%   70%)', 'hsl( 30deg  100%   80%)', 'hsl( 30deg  100%   90%)' ],
		D: [ 'hsl( 45deg   25%   30%)', 'hsl( 45deg   50%   30%)', 'hsl( 45deg   75%   30%)', 'hsl( 45deg  100%   30%)', 'hsl( 45deg  100%   40%)', 'hsl( 45deg  100%   50%)', 'hsl( 45deg  100%   60%)', 'hsl( 45deg  100%   70%)', 'hsl( 45deg  100%   80%)', 'hsl( 45deg  100%   90%)' ],
		E: [ 'hsl( 60deg   25%   30%)', 'hsl( 60deg   50%   30%)', 'hsl( 60deg   75%   30%)', 'hsl( 60deg  100%   30%)', 'hsl( 60deg  100%   40%)', 'hsl( 60deg  100%   50%)', 'hsl( 60deg  100%   60%)', 'hsl( 60deg  100%   70%)', 'hsl( 60deg  100%   80%)', 'hsl( 60deg  100%   90%)' ],
		F: [ 'hsl( 75deg   25%   30%)', 'hsl( 75deg   50%   30%)', 'hsl( 75deg   75%   30%)', 'hsl( 75deg  100%   30%)', 'hsl( 75deg  100%   40%)', 'hsl( 75deg  100%   50%)', 'hsl( 75deg  100%   60%)', 'hsl( 75deg  100%   70%)', 'hsl( 75deg  100%   80%)', 'hsl( 75deg  100%   90%)' ],
		G: [ 'hsl( 90deg   25%   30%)', 'hsl( 90deg   50%   30%)', 'hsl( 90deg   75%   30%)', 'hsl( 90deg  100%   30%)', 'hsl( 90deg  100%   40%)', 'hsl( 90deg  100%   50%)', 'hsl( 90deg  100%   60%)', 'hsl( 90deg  100%   70%)', 'hsl( 90deg  100%   80%)', 'hsl( 90deg  100%   90%)' ],
		H: [ 'hsl(105deg   25%   30%)', 'hsl(105deg   50%   30%)', 'hsl(105deg   75%   30%)', 'hsl(105deg  100%   30%)', 'hsl(105deg  100%   40%)', 'hsl(105deg  100%   50%)', 'hsl(105deg  100%   60%)', 'hsl(105deg  100%   70%)', 'hsl(105deg  100%   80%)', 'hsl(105deg  100%   90%)' ],
		I: [ 'hsl(120deg   25%   30%)', 'hsl(120deg   50%   30%)', 'hsl(120deg   75%   30%)', 'hsl(120deg  100%   30%)', 'hsl(120deg  100%   40%)', 'hsl(120deg  100%   50%)', 'hsl(120deg  100%   60%)', 'hsl(120deg  100%   70%)', 'hsl(120deg  100%   80%)', 'hsl(120deg  100%   90%)' ],
		J: [ 'hsl(135deg   25%   30%)', 'hsl(135deg   50%   30%)', 'hsl(135deg   75%   30%)', 'hsl(135deg  100%   30%)', 'hsl(135deg  100%   40%)', 'hsl(135deg  100%   50%)', 'hsl(135deg  100%   60%)', 'hsl(135deg  100%   70%)', 'hsl(135deg  100%   80%)', 'hsl(135deg  100%   90%)' ],
		K: [ 'hsl(150deg   25%   30%)', 'hsl(150deg   50%   30%)', 'hsl(150deg   75%   30%)', 'hsl(150deg  100%   30%)', 'hsl(150deg  100%   40%)', 'hsl(150deg  100%   50%)', 'hsl(150deg  100%   60%)', 'hsl(150deg  100%   70%)', 'hsl(150deg  100%   80%)', 'hsl(150deg  100%   90%)' ],
		L: [ 'hsl(165deg   25%   30%)', 'hsl(165deg   50%   30%)', 'hsl(165deg   75%   30%)', 'hsl(165deg  100%   30%)', 'hsl(165deg  100%   40%)', 'hsl(165deg  100%   50%)', 'hsl(165deg  100%   60%)', 'hsl(165deg  100%   70%)', 'hsl(165deg  100%   80%)', 'hsl(165deg  100%   90%)' ],
		M: [ 'hsl(180deg   25%   30%)', 'hsl(180deg   50%   30%)', 'hsl(180deg   75%   30%)', 'hsl(180deg  100%   30%)', 'hsl(180deg  100%   40%)', 'hsl(180deg  100%   50%)', 'hsl(180deg  100%   60%)', 'hsl(180deg  100%   70%)', 'hsl(180deg  100%   80%)', 'hsl(180deg  100%   90%)' ],
		N: [ 'hsl(195deg   25%   30%)', 'hsl(195deg   50%   30%)', 'hsl(195deg   75%   30%)', 'hsl(195deg  100%   30%)', 'hsl(195deg  100%   40%)', 'hsl(195deg  100%   50%)', 'hsl(195deg  100%   60%)', 'hsl(195deg  100%   70%)', 'hsl(195deg  100%   80%)', 'hsl(195deg  100%   90%)' ],
		O: [ 'hsl(210deg   25%   30%)', 'hsl(210deg   50%   30%)', 'hsl(210deg   75%   30%)', 'hsl(210deg  100%   30%)', 'hsl(210deg  100%   40%)', 'hsl(210deg  100%   50%)', 'hsl(210deg  100%   60%)', 'hsl(210deg  100%   70%)', 'hsl(210deg  100%   80%)', 'hsl(210deg  100%   90%)' ],
		P: [ 'hsl(225deg   25%   30%)', 'hsl(225deg   50%   30%)', 'hsl(225deg   75%   30%)', 'hsl(225deg  100%   30%)', 'hsl(225deg  100%   40%)', 'hsl(225deg  100%   50%)', 'hsl(225deg  100%   60%)', 'hsl(225deg  100%   70%)', 'hsl(225deg  100%   80%)', 'hsl(225deg  100%   90%)' ],
		Q: [ 'hsl(240deg   25%   30%)', 'hsl(240deg   50%   30%)', 'hsl(240deg   75%   30%)', 'hsl(240deg  100%   30%)', 'hsl(240deg  100%   40%)', 'hsl(240deg  100%   50%)', 'hsl(240deg  100%   60%)', 'hsl(240deg  100%   70%)', 'hsl(240deg  100%   80%)', 'hsl(240deg  100%   90%)' ],
		R: [ 'hsl(255deg   25%   30%)', 'hsl(255deg   50%   30%)', 'hsl(255deg   75%   30%)', 'hsl(255deg  100%   30%)', 'hsl(255deg  100%   40%)', 'hsl(255deg  100%   50%)', 'hsl(255deg  100%   60%)', 'hsl(255deg  100%   70%)', 'hsl(255deg  100%   80%)', 'hsl(255deg  100%   90%)' ],
		S: [ 'hsl(270deg   25%   30%)', 'hsl(270deg   50%   30%)', 'hsl(270deg   75%   30%)', 'hsl(270deg  100%   30%)', 'hsl(270deg  100%   40%)', 'hsl(270deg  100%   50%)', 'hsl(270deg  100%   60%)', 'hsl(270deg  100%   70%)', 'hsl(270deg  100%   80%)', 'hsl(270deg  100%   90%)' ],
		T: [ 'hsl(285deg   25%   30%)', 'hsl(285deg   50%   30%)', 'hsl(285deg   75%   30%)', 'hsl(285deg  100%   30%)', 'hsl(285deg  100%   40%)', 'hsl(285deg  100%   50%)', 'hsl(285deg  100%   60%)', 'hsl(285deg  100%   70%)', 'hsl(285deg  100%   80%)', 'hsl(285deg  100%   90%)' ],
		U: [ 'hsl(300deg   25%   30%)', 'hsl(300deg   50%   30%)', 'hsl(300deg   75%   30%)', 'hsl(300deg  100%   30%)', 'hsl(300deg  100%   40%)', 'hsl(300deg  100%   50%)', 'hsl(300deg  100%   60%)', 'hsl(300deg  100%   70%)', 'hsl(300deg  100%   80%)', 'hsl(300deg  100%   90%)' ],
		V: [ 'hsl(315deg   25%   30%)', 'hsl(315deg   50%   30%)', 'hsl(315deg   75%   30%)', 'hsl(315deg  100%   30%)', 'hsl(315deg  100%   40%)', 'hsl(315deg  100%   50%)', 'hsl(315deg  100%   60%)', 'hsl(315deg  100%   70%)', 'hsl(315deg  100%   80%)', 'hsl(315deg  100%   90%)' ],
		W: [ 'hsl(330deg   25%   30%)', 'hsl(330deg   50%   30%)', 'hsl(330deg   75%   30%)', 'hsl(330deg  100%   30%)', 'hsl(330deg  100%   40%)', 'hsl(330deg  100%   50%)', 'hsl(330deg  100%   60%)', 'hsl(330deg  100%   70%)', 'hsl(330deg  100%   80%)', 'hsl(330deg  100%   90%)' ],
		X: [ 'hsl(345deg   25%   30%)', 'hsl(345deg   50%   30%)', 'hsl(345deg   75%   30%)', 'hsl(345deg  100%   30%)', 'hsl(345deg  100%   40%)', 'hsl(345deg  100%   50%)', 'hsl(345deg  100%   60%)', 'hsl(345deg  100%   70%)', 'hsl(345deg  100%   80%)', 'hsl(345deg  100%   90%)' ],
	},
	COLS = Object.keys(GRID),
	ROWS = Object.keys(GRID.A);

function isGuessClose(guess)
{
	const x0 = gCurrentTint.charCodeAt(0);
	const y0 = gCurrentTint.charCodeAt(1);
	const x1 = guess.charCodeAt(0);
	const y1 = guess.charCodeAt(1);
	return (x0 - 1 === x1 || x0 === x1 || x0 + 1 === x1) && (y0 - 1 === y1 || y0 === y1 || y0 + 1 === y1);
}

function nextTurn()
{
	// Parse the guesses and update people's scores.
	const got = new Set();
	if (g1stGuesses != null)
	{
		for (const i of g1stGuesses)
		{
			const id = getPlayerByName(i.name);
			if (id == null)
			{
			}
			else if (i.guess === gCurrentTint)
			{
				// 5 points for a correct first guess.
				gUserData[id].score += 5;
				got.add(id);
			}
			else if (isGuessClose(i.guess))
			{
				// 2 points for a close first guess.
				gUserData[id].score += 2;
			}
		}
	}
	if (g2ndGuesses != null)
	{
		for (const i of g2ndGuesses)
		{
			const id = getPlayerByName(i.name);
			if (id == null)
			{
			}
			else if (i.guess === gCurrentTint)
			{
				// 3 points for a correct second guess.
				gUserData[id].score += 4;
				got.add(id);
			}
			else if (isGuessClose(i.guess))
			{
				// 1 point for a close second guess.
				gUserData[id].score += 1;
			}
		}
	}
	if (gCurrentPlayer !== -1)
	{
		gUserData[gCurrentPlayer].score += got.size * 3;
		gCurrentPlayer = (gCurrentPlayer + 1) % gUserData.length;
	}
	clearGuesses();
	gCurrentTint = COLS[Math.floor(Math.random() * COLS.length)] + ROWS[Math.floor(Math.random() * ROWS.length)];
}

function getState(name)
{
	const id = getPlayerByName(name);
	return {
		first: g1stGuesses,
		second: g2ndGuesses,
		current: gCurrentPlayer,
		id,
		players: gUserData,
		tint: (id === gCurrentPlayer) ? gCurrentTint : '??',
	};
}

// Serving static files (HTML, CSS, JS)
app.use(express.static('public'));

app.use(function (req, res, next)
{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

app.use(express.json());

// Repeatedly get the current server state.
app.get('/api/poll', function (req, res)
{
	const { name } = req.query;
	res.json(getState(name));
});

app.get('/api/start', function (req, res)
{
	nextTurn();
	for (const i of gUserData)
	{
		i.score = 0;
	}
	gCurrentPlayer = Math.floor(Math.random() * gUserData.length);
	res.json({ current: gCurrentPlayer });
});

app.get('/api/stop', function (req, res)
{
	clearGuesses();
	gCurrentPlayer = -1;
	res.json({ });
});

app.post('/api/next', function (req, res)
{
	const { name, guess } = req.body;
	const id = getPlayerByName(name);
	if (id !== gCurrentPlayer)
	{
		res.json({ failed: 'You are not the hinter.' });
	}
	else if (g2ndGuesses == null)
	{
		if (g1stGuesses.length === gUserData.length - 1)
		{
			g2ndGuesses = [];
			res.json({ });
		}
		else
		{
			res.json({ failed: 'Guessing is not complete.' });
		}
	}
	else
	{
		if (g2ndGuesses.length === gUserData.length - 1)
		{
			nextTurn();
			res.json({ });
		}
		else
		{
			res.json({ failed: 'Guessing is not complete.' });
		}
	}
});

app.post('/api/guess', function (req, res)
{
	const { name, guess } = req.body;
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
	else if (g2ndGuesses == null)
	{
		for (const i of g1stGuesses)
		{
			if (i.name === name)
			{
				res.json({ failed: 'Please wait for others to guess.' });
				return;
			}
		}
		g1stGuesses.push({
			name,
			guess,
			x: 0,
			y: 0,
			colour: gUserData[id].colour,
			first: true,
		});
		res.json(getState(name));
	}
	else
	{
		for (const i of g2ndGuesses)
		{
			if (i.name === name)
			{
				res.json({ failed: 'Please wait for others to guess.' });
				return;
			}
		}
		g2ndGuesses.push({
			name,
			guess,
			x: 0,
			y: 0,
			colour: gUserData[id].colour,
			first: false,
		});
		res.json(getState(name));
	}
});

app.post('/api/add-player', function (req, res)
{
	const { name, colour } = req.body;
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
app.listen(PORT, function ()
{
	console.log(`Server is listening at http://localhost:${PORT}`);
});

