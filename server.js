const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = "your-secret-key";
const dataPath = path.join(__dirname, 'uploads', 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Helper functions
function readData() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// ✅ Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
app.get('/api/login', (req, res) => {
  res.send("Login API only accepts POST requests 🔐");
});
// ✅ GET movies
app.get('/api/movies', (req, res) => {
  try {
    const movies = readData();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// ✅ POST new movie
app.post('/api/movies', (req, res) => {
  try {
    const newMovie = req.body;
    const movies = readData();
    movies.push(newMovie);
    writeData(movies);
    res.status(201).json({ message: 'Movie added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
