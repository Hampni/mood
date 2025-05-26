import React, { useState } from 'react';
import MoodForm from './components/MoodForm';
import MoodCalendar from './components/MoodCalendar';
import MoodStats from './components/MoodStats';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [userId, setUserId] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).id : null;
  });
  const [username, setUsername] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).username : '';
  });
  const [activeTab, setActiveTab] = useState('form');

  const handleLogin = (id, name) => {
    setUserId(id);
    setUsername(name);
    localStorage.setItem('user', JSON.stringify({ id, username: name }));
  };

  const handleLogout = () => {
    setUserId(null);
    setUsername('');
    localStorage.removeItem('user');
  };

  if (!userId) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          <span>Пользователь: {username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <nav className="main-nav">
        <a
          href="#"
          className={activeTab === 'form' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('form');
          }}
        >
          Записать настроение
        </a>
        <a
          href="#"
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('calendar');
          }}
        >
          Календарь
        </a>
        <a
          href="#"
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('stats');
          }}
        >
          Статистика
        </a>
      </nav>

      <main>
        {activeTab === 'form' && <MoodForm userId={userId} />}
        {activeTab === 'calendar' && <MoodCalendar userId={userId} />}
        {activeTab === 'stats' && <MoodStats userId={userId} />}
      </main>
    </div>
  );
}

export default App; 