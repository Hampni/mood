const mongoose = require('mongoose');
const Mood = require('./models/Mood');
const User = require('./models/User');

// Подключение к MongoDB
mongoose.connect('mongodb://mongo:27017/mood_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

const moodDescriptions = [
  'Отлично',
  'Хорошо',
  'Нормально',
  'Устал',
  'Стресс',
  'Подавлен',
  'Спокойно',
  'Утомлен',
  'Радость',
  'Тревога',
  'Бодрость',
  'Разбитость',
  'Энергия',
  'Апатия',
  'Вдохновение'
];

const seedData = async () => {
  try {
    // Создаем тестового пользователя
    const user = await User.findOne({ username: 'test' });
    if (!user) {
      const newUser = new User({
        username: 'test',
        password: 'test123'
      });
      await newUser.save();
      console.log('Test user created');
    }

    // Получаем ID пользователя
    const userId = user ? user._id : (await User.findOne({ username: 'test' }))._id;

    // Удаляем старые данные
    await Mood.deleteMany({ userId });

    // Создаем тестовые данные за последний месяц
    const moods = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Создаем записи за последние 30 дней, исключая сегодняшний день
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Случайное время в течение дня
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const entryDate = new Date(date);
      entryDate.setHours(hour, minute, 0, 0);
      
      moods.push({
        userId,
        color: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)],
        intensity: Math.floor(Math.random() * 3) + 1, // от 1 до 3
        description: moodDescriptions[Math.floor(Math.random() * moodDescriptions.length)],
        createdAt: entryDate
      });
    }

    await Mood.insertMany(moods);
    console.log('Test data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 