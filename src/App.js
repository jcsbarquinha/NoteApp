import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import WeeklyPlanner from './components/WeeklyPlanner';
import WeekPage from './components/WeekPage';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';



function App() {
  const [weeks, setWeeks] = useState(['week1', 'week2', 'week3']);
  const [selectedWeek, setSelectedWeek] = useState('week1'); // Added state for selected week
  const [newWeekName, setNewWeekName] = useState(''); // Added state for new week name input
  const [editingWeek, setEditingWeek] = useState(null); // Added state for editing week
  const [creatingWeek, setCreatingWeek] = useState(false); // New state to handle the creation of a new week
  const [originalWeekName, setOriginalWeekName] = useState('');
  const navigate = useNavigate(); 



  // Initialize weekData with Monday and Tuesday sections for each week
  const [weekData, setWeekData] = useState({
    week1: {
      Monday: [],
      Tuesday: [],
    },
    week2: {
      Monday: [],
      Tuesday: [],
    },
    week3: {
      Monday: [],
      Tuesday: [],
    },
  });

  const createWeek = (newWeek) => {
    setWeeks([...weeks, newWeek]);

    // When creating a new week, initialize its data with Monday and Tuesday sections
    setWeekData((prevWeekData) => ({
      ...prevWeekData,
      [newWeek]: {
        Monday: [],
        Tuesday: [],
      },
    }));
  };

  const deleteWeek = (weekId) => {
    setWeeks(weeks.filter((week) => week !== weekId));

    // When deleting a week, remove its data as well
    setWeekData((prevWeekData) => {
      const { [weekId]: deletedWeekData, ...restWeekData } = prevWeekData;
      return restWeekData;
    });
  };

  const renameWeek = (oldWeekId, newWeekId) => {
    if (newWeekId.trim() === '' || weeks.includes(newWeekId) || newWeekId === oldWeekId) {
      // Exit if the new week name is empty, already exists, or is the same as the old name
      return;
    }
  
    // Update the weeks array with the new week name
    const updatedWeeks = weeks.map((week) => week === oldWeekId ? newWeekId : week);
    setWeeks(updatedWeeks);
  
    // Update the weekData with the new week name, preserving the data
    const newDataForWeek = { ...weekData[oldWeekId] };
    const updatedWeekData = { ...weekData, [newWeekId]: newDataForWeek };
    delete updatedWeekData[oldWeekId]; // Remove the old week data
    setWeekData(updatedWeekData);
  
    // Update selectedWeek if it's the one being renamed
    if (selectedWeek === oldWeekId) {
      setSelectedWeek(newWeekId);
    }
  
    // Navigate to the new week's page
    navigate(`/week/${newWeekId}`);
  };

  


  // Handler for clicking on week titles
  const handleWeekClick = (week) => {
    setSelectedWeek(week);
  };

  // Handler for creating a new week
  const createNewWeek = () => {
    if (newWeekName.trim() === '') {
      return;
    }
    createWeek(newWeekName);
    setNewWeekName('');
  };

  const handleWeekKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (newWeekName.trim() !== '' && newWeekName !== originalWeekName) {
        renameWeek(editingWeek, newWeekName, weekData[editingWeek], setWeekData);
        navigate(`/week/${newWeekName}`); // Add navigation here instead
      }
      setEditingWeek(null);
      setOriginalWeekName('');
    }
  };
  
  // Handler for handling blur when editing week
  const handleWeekBlur = () => {
    if (newWeekName.trim() !== '' && newWeekName !== originalWeekName) {
      renameWeek(editingWeek, newWeekName, weekData[editingWeek], setWeekData);
    }
    setEditingWeek(null);
    setOriginalWeekName(''); // Reset the original week name
  };


  const handleNewWeekInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      createNewWeek();
      setCreatingWeek(false); // Hide the input field after creating the week
    }
  };

  const handleAddWeekClick = () => {
    setCreatingWeek(true); // Show the input field when the button is clicked
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
  
    const newWeeks = Array.from(weeks);
    const [removed] = newWeeks.splice(source.index, 1);
    newWeeks.splice(destination.index, 0, removed);
  
    setWeeks(newWeeks);
  };

  

  return (
      <div className="app">
        <header>
          <h1>Note App</h1>
        </header>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-weeks" direction="horizontal">
            {(provided) => (
              <div
                className="week-title-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {weeks.map((week, index) => (
                  <Draggable key={week} draggableId={week} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`week-title ${selectedWeek === week ? 'selected' : ''}`}
                        onClick={() => handleWeekClick(week)}
                        onDoubleClick={() => {
                          setEditingWeek(week);
                          setNewWeekName(week);
                          setOriginalWeekName(week);
                        }}
                        
                      >
                        {editingWeek === week ? (
                          <input
                            type="text"
                            value={newWeekName}
                            onChange={(e) => setNewWeekName(e.target.value)}
                            onKeyPress={handleWeekKeyPress}
                            onBlur={handleWeekBlur}
                            autoFocus
                          />
                        ) : (
                          <Link to={`/week/${week}`} className="week-link">
                            {week}
                          </Link>
                        )}
                        <span className="delete-week" onClick={() => deleteWeek(week)}>
                          x
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {creatingWeek ? (
            <input
              className="new-week-input"
              type="text"
              placeholder="New Week Name"
              value={newWeekName}
              onChange={(e) => setNewWeekName(e.target.value)}
              onKeyPress={handleNewWeekInputKeyPress}
              onBlur={() => setCreatingWeek(false)}
              autoFocus
            />
          ) : (
            <button className="add-week" onClick={handleAddWeekClick}>
              add week
            </button>
          )}
        </DragDropContext>
        <Routes>
          <Route
            path="/"
            element={<WeeklyPlanner weekId={selectedWeek} data={weekData[selectedWeek]} />}
          />
          {weeks.map((week) => (
            <Route
              key={week} // The key should be unique and change if the week name changes
              path={`/week/${week}`}
              element={<WeeklyPlanner weekId={week} data={weekData[week]} />}
            />
          ))}
        </Routes>
      </div>
  );
}


export default App;
//testing commit
