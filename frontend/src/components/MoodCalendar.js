import React, { useState, useEffect } from 'react';
import './MoodCalendar.css';

const MoodCalendar = ({ userId }) => {
  const [calendarData, setCalendarData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getColorWithIntensity = (mood) => {
    if (!mood) return '#f5f5f5';
    
    const intensity = mood.intensity || 1;
    const baseColors = {
      '#00ff00': {
        1: '#90EE90', // Светло-зеленый
        2: '#7CCD7C', // Средне-зеленый
        3: '#66CD66'  // Насыщенный зеленый
      },
      '#ffff00': {
        1: '#FFEB3B', // Яркий желтый
        2: '#FFD700', // Золотой
        3: '#FFC107'  // Янтарный
      },
      '#ff0000': {
        1: '#FF6B6B', // Светло-красный
        2: '#FF5252', // Средне-красный
        3: '#FF3D3D'  // Насыщенный красный
      }
    };

    return baseColors[mood.color]?.[intensity] || mood.color;
  };

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/moods/monthly?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`,
          {
            headers: {
              'user-id': userId
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setCalendarData(data);
        } else {
          setError('Ошибка при загрузке данных календаря');
        }
      } catch (error) {
        setError('Ошибка при загрузке данных календаря');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [userId, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (loading) {
    return <div className="calendar-loading">Загрузка календаря...</div>;
  }

  if (error) {
    return <div className="calendar-error">{error}</div>;
  }

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="mood-calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayData = calendarData[day];
          
          return (
            <div
              key={day}
              className="calendar-day"
              style={{
                backgroundColor: dayData ? getColorWithIntensity(dayData) : '#f0f0f0'
              }}
              title={dayData ? `Интенсивность: ${dayData.intensity}\n${dayData.description}` : ''}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCalendar; 