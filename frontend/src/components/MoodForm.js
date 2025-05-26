import React, { useState, useEffect } from 'react';
import './MoodForm.css';

const MoodForm = ({ userId }) => {
  const [color, setColor] = useState('green');
  const [intensity, setIntensity] = useState(1);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTodayEntry = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/moods/check-today', {
          headers: {
            'user-id': userId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasEntryToday(data.hasEntryToday);
        }
      } catch (error) {
        console.error('Ошибка при проверке записи:', error);
      } finally {
        setLoading(false);
      }
    };

    checkTodayEntry();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify({ color, intensity, description })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Настроение успешно сохранено!');
        setColor('green');
        setIntensity(1);
        setDescription('');
        setHasEntryToday(true);
      } else {
        setMessage(data.message || 'Произошла ошибка при сохранении');
      }
    } catch (error) {
      setMessage('Произошла ошибка при сохранении');
    }
  };

  if (loading) {
    return <div className="mood-form-loading">Загрузка...</div>;
  }

  if (hasEntryToday) {
    return (
      <div className="mood-form-message">
        <h2>Вы уже отметили своё настроение сегодня</h2>
        <p>Завтра вы сможете добавить новую запись</p>
      </div>
    );
  }

  return (
    <form className="mood-form" onSubmit={handleSubmit}>
      <h2>Как ваше настроение сегодня?</h2>
      
      <div className="form-group">
        <label>Цвет настроения:</label>
        <div className="color-buttons">
          <button
            type="button"
            className={`color-button ${color === 'green' ? 'active' : ''}`}
            onClick={() => setColor('green')}
            data-color="green"
            aria-label="Зеленый"
          />
          <button
            type="button"
            className={`color-button ${color === 'yellow' ? 'active' : ''}`}
            onClick={() => setColor('yellow')}
            data-color="yellow"
            aria-label="Желтый"
          />
          <button
            type="button"
            className={`color-button ${color === 'red' ? 'active' : ''}`}
            onClick={() => setColor('red')}
            data-color="red"
            aria-label="Красный"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Интенсивность:</label>
        <select
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="intensity-select"
          required
        >
          <option value={1}>1 - Слабая</option>
          <option value={2}>2 - Средняя</option>
          <option value={3}>3 - Сильная</option>
        </select>
      </div>

      <div className="form-group">
        <label>Описание:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите ваше настроение..."
          required
          className="description-input"
        />
      </div>

      {message && <div className="form-message">{message}</div>}

      <button type="submit" className="submit-button">
        Сохранить
      </button>
    </form>
  );
};

export default MoodForm; 