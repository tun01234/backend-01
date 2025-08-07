const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = "your-secret-key";
const dataPath = path.join(__dirname, 'uploads', 'data.json');

// ✅ CORS FIX
app.use(cors({
  origin: "https://movieplus01.netlify.app"
}));

app.use(express.json());
app.use(express.static('uploads'));

// ✅ Multer config
const upload = multer({ dest: 'uploads/' }); // Store files in uploads/ folder

// ✅ Upload API
app.post('/api/upload', upload.fields([{ name: 'poster' }, { name: 'video' }]), (req, res) => {
  try {
    const { title, description, year, rating } = req.body;

    const poster = req.files['poster']?.[0]?.filename;
    const video = req.files['video']?.[0]?.filename;

    const newMovie = {
      title,
      description,
      year,
      rating,
      poster: poster ? `/uploads/${poster}` : '',
      video: video ? `/uploads/${video}` : ''
    };

    const movies = readData();
    movies.push(newMovie);
    writeData(movies);

    res.status(201).json({ message: "✅ Movie uploaded successfully with files!" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "❌ Failed to upload movie" });
  }
});

// ✅ Helper functions
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
