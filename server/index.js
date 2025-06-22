const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const leaderboardsDir = path.join(__dirname, '../public/leaderboards');

// GET endpoint to fetch a leaderboard
app.get('/leaderboards/:type', async (req, res) => {
  const { type } = req.params;
  const filePath = path.join(leaderboardsDir, `${type}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found, return empty array
      res.json([]);
    } else {
      console.error(`Error reading leaderboard file: ${type}.json`, error);
      res.status(500).send('Error reading leaderboard data');
    }
  }
});

// POST endpoint to update a leaderboard
app.post('/leaderboards/:type', async (req, res) => {
  const { type } = req.params;
  const newEntry = req.body;
  const filePath = path.join(leaderboardsDir, `${type}.json`);

  try {
    let leaderboard = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      leaderboard = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // If file doesn't exist, we start with an empty array
    }

    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    const updatedLeaderboard = leaderboard.slice(0, 10);

    await fs.writeFile(filePath, JSON.stringify(updatedLeaderboard, null, 2), 'utf-8');
    res.status(200).json(updatedLeaderboard);
  } catch (error) {
    console.error(`Error writing to leaderboard file: ${type}.json`, error);
    res.status(500).send('Error updating leaderboard data');
  }
});

app.listen(port, () => {
  console.log(`Leaderboard server listening at http://localhost:${port}`);
}); 