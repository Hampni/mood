const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const Mood = require('./models/Mood');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 4000;

// WebSocket подключение
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://mongo:27017/mood_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Простой middleware для проверки авторизации
const authMiddleware = async (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ошибка авторизации' });
  }
};

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ id: user._id, username: user.username });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    res.json({ id: user._id, username: user.username });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Маршрут для проверки наличия записи за текущий день
app.get('/api/moods/check-today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingMood = await Mood.findOne({
      userId: req.userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.json({ hasEntryToday: !!existingMood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Маршрут для сохранения настроения
app.post('/api/moods', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingMood = await Mood.findOne({
      userId: req.userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingMood) {
      return res.status(400).json({ message: 'Вы уже отметили своё настроение сегодня' });
    }

    const mood = new Mood({
      ...req.body,
      userId: req.userId
    });
    await mood.save();
    res.status(201).json(mood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Маршрут для получения настроений пользователя
app.get('/api/moods', authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Маршрут для получения статистики настроений
app.get('/api/moods/stats', authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId });

    const stats = {
      colorStats: {
        green: 0,
        yellow: 0,
        red: 0
      },
      descriptions: {
        green: [],
        yellow: [],
        red: []
      }
    };

    moods.forEach(mood => {
      // Подсчет по цветам и сбор описаний
      if (mood.color === 'green') {
        stats.colorStats.green++;
        if (mood.description) {
          stats.descriptions.green.push(mood.description);
        }
      } else if (mood.color === 'yellow') {
        stats.colorStats.yellow++;
        if (mood.description) {
          stats.descriptions.yellow.push(mood.description);
        }
      } else if (mood.color === 'red') {
        stats.colorStats.red++;
        if (mood.description) {
          stats.descriptions.red.push(mood.description);
        }
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

// Маршрут для получения данных по месяцам
app.get('/api/moods/monthly', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const moods = await Mood.find({
      userId: req.userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Преобразуем данные в формат для календаря
    const calendarData = {};
    moods.forEach(mood => {
      const day = new Date(mood.createdAt).getDate();
      calendarData[day] = {
        color: mood.color,
        intensity: mood.intensity,
        description: mood.description
      };
    });

    // Добавляем пустые дни
    for (let i = 1; i <= endDate.getDate(); i++) {
      if (!calendarData[i]) {
        calendarData[i] = null;
      }
    }

    res.json(calendarData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Заменяем app.listen на server.listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 