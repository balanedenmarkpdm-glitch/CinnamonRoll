require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI ||
  'mongodb+srv://balanedenmarkpdm_db_user:balane440@cluster0.ybe0qzn.mongodb.net/registerdb?appName=Cluster0';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PUBLIC = path.join(process.cwd(), 'public');
app.use(express.static(PUBLIC));

app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'home.html')));
app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(PUBLIC, req.params.page + '.html'), err => {
    if (err) res.status(404).send('Page not found: ' + req.params.page + '.html');
  });
});

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

let cached = null;
async function db() {
  if (mongoose.connection.readyState === 1) return;
  if (!cached) {
    cached = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .catch(err => { cached = null; throw err; });
  }
  await cached;
}

const register = async (req, res) => {
  try {
    await db();
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    if (await User.findOne({ username })) return res.status(400).json({ message: 'User exists' });
    await User.create({ username, password: await bcrypt.hash(password, 10) });
    res.json({ message: 'Registered' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const login = async (req, res) => {
  try {
    await db();
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.json({ message: 'Login success' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

app.post(['/api/register', '/register'], register);
app.post(['/api/login', '/login'], login);

app.get('/api/health', async (req, res) => {
  try {
    await db();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('Running on http://localhost:3000'));
}