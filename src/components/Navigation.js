import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navigation({ weeks, createWeek, deleteWeek, renameWeek, currentWeek, setCurrentWeek }) {
  const [newWeekName, setNewWeekName] = useState('');

  const handleCreateWeek = () => {
    if (newWeekName.trim() !== '') {
      createWeek(newWeekName);
      setNewWeekName('');
    }
  };

  const handleDeleteWeek = (weekId) => {
    deleteWeek(weekId);
  };

  const handleRenameWeek = (oldWeekId, newWeekName) => {
    renameWeek(oldWeekId, newWeekName);
  };

  return (
    <div className="navigation">
      <div className="week-titles">
        {weeks.map((week) => (
          <div key={week} className="week-title">
            <Link to={`/week/${week}`} className="week-link">
              {week}
            </Link>
            <span className="delete-week" onClick={() => handleDeleteWeek(week)}>
              X
            </span>
          </div>
        ))}
      </div>
      <div className="create-week">
        <input
          type="text"
          placeholder="New Week Name"
          value={newWeekName}
          onChange={(e) => setNewWeekName(e.target.value)}
        />
        <button onClick={handleCreateWeek}>Create Week</button>
      </div>
    </div>
  );
}

export default Navigation;
