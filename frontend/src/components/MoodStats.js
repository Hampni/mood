import React, { useState, useEffect } from 'react';
import './MoodStats.css';

const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const COLOR_LABELS = {
  '#ff0000': 'Красный',
  '#00ff00': 'Зеленый',
  '#0000ff': 'Синий'
};

const MoodStats = ({ userId }) => {
  const [stats, setStats] = useState({
    colorStats: { green: 0, yellow: 0, red: 0 },
    descriptions: {
      green: [],
      yellow: [],
      red: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/moods/stats', {
          headers: {
            'user-id': userId
          }
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить статистику');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return <div className="mood-stats">Загрузка статистики...</div>;
  }

  if (error) {
    return <div className="mood-stats error">{error}</div>;
  }

  const totalEntries = Object.values(stats.colorStats).reduce((sum, count) => sum + count, 0);

  const getPercentage = (value) => {
    if (totalEntries === 0) return 0;
    return ((value / totalEntries) * 100).toFixed(1);
  };

  const maxHeight = 300; // максимальная высота колонки в пикселях

  return (
    <div className="mood-stats">
      <h2>Статистика настроений</h2>
      
      <div className="stats-container">
        <div className="stats-columns">
          <div className="stats-column">
            <div 
              className="column-bar green" 
              style={{ height: `${(stats.colorStats.green / totalEntries) * maxHeight}px` }}
            >
              <span className="column-value">{stats.colorStats.green}</span>
            </div>
            <div className="column-label">
              <div className="color-indicator green"></div>
              <span>Зеленый</span>
              <span className="percentage">{getPercentage(stats.colorStats.green)}%</span>
            </div>
            <div className="descriptions-list">
              {stats.descriptions.green.map((desc, index) => (
                <div key={index} className="description-item">
                  {desc}
                </div>
              ))}
            </div>
          </div>

          <div className="stats-column">
            <div 
              className="column-bar yellow" 
              style={{ height: `${(stats.colorStats.yellow / totalEntries) * maxHeight}px` }}
            >
              <span className="column-value">{stats.colorStats.yellow}</span>
            </div>
            <div className="column-label">
              <div className="color-indicator yellow"></div>
              <span>Желтый</span>
              <span className="percentage">{getPercentage(stats.colorStats.yellow)}%</span>
            </div>
            <div className="descriptions-list">
              {stats.descriptions.yellow.map((desc, index) => (
                <div key={index} className="description-item">
                  {desc}
                </div>
              ))}
            </div>
          </div>

          <div className="stats-column">
            <div 
              className="column-bar red" 
              style={{ height: `${(stats.colorStats.red / totalEntries) * maxHeight}px` }}
            >
              <span className="column-value">{stats.colorStats.red}</span>
            </div>
            <div className="column-label">
              <div className="color-indicator red"></div>
              <span>Красный</span>
              <span className="percentage">{getPercentage(stats.colorStats.red)}%</span>
            </div>
            <div className="descriptions-list">
              {stats.descriptions.red.map((desc, index) => (
                <div key={index} className="description-item">
                  {desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodStats; 