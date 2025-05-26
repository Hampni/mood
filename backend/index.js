const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Подключение к MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/mood_db';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const moodSchema = new mongoose.Schema({
  color: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    required: true,
  },
  intensity: {
    type: Number,
    min: 1,
    max: 3,
    required: true,
  },
  word: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Mood = mongoose.model('Mood', moodSchema);

app.get('/', (req, res) => {
  res.json({ message: 'Привет! Это тестовый бэкенд' });
});

// Эндпоинт для сохранения состояния
app.post('/mood', async (req, res) => {
  try {
    const { color, intensity, word } = req.body;
    const mood = new Mood({ color, intensity, word });
    await mood.save();
    res.status(201).json({ message: 'Состояние сохранено', mood });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
}); 