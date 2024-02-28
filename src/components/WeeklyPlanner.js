// src/components/WeeklyPlanner.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function WeeklyPlanner({ weekId, data }) {
  const [inputValues, setInputValues] = useState({ Monday: '', Tuesday: '', newSectionName: '' });
  const [notes, setNotes] = useState(data[weekId] || []); // Initialize notes with data for the specific week
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [creatingSection, setCreatingSection] = useState(false);
  const [minimizedSections, setMinimizedSections] = useState({});

  // Ensure notes are updated when data prop changes (e.g., switching weeks)
  useEffect(() => {
    setNotes(data[weekId] || {});
  }, [weekId, data]);

  useEffect(() => {
    console.log(`weekId has changed to: ${weekId}`);
    console.log(`data prop is now:`, data);
    setNotes(data[weekId] || {});
  }, [weekId, data]);

  // Load notes data from local storage on component mount
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem(`notes_${weekId}`)) || [];
    setNotes(savedNotes);
  }, [weekId]);

  // Save notes data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(`notes_${weekId}`, JSON.stringify(notes));
  }, [notes, weekId]);


  const addNote = (section) => {
    if (!inputValues[section]) return;
    const newNote = { id: `${section}-${Date.now()}`, content: inputValues[section], completed: false };
    const updatedNotes = notes.map((note) => {
      if (note.id === section) {
        return { ...note, notes: [...note.notes, newNote] };
      }
      return note;
    });
    setNotes(updatedNotes);
    setInputValues({ ...inputValues, [section]: '' });
  };

  const deleteNote = (section, noteId) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === section) {
        return { ...note, notes: note.notes.filter((item) => item.id !== noteId) };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const toggleComplete = (noteId) => {
    const [noteSection, noteIndex] = findNoteById(noteId);
    const updatedNotes = notes.map((note) => {
      if (note.id === noteSection) {
        const sectionNotes = [...note.notes];
        const currentNote = sectionNotes[noteIndex];
        currentNote.completed = !currentNote.completed;
        return { ...note, notes: sectionNotes };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const findNoteById = (noteId) => {
    for (let i = 0; i < notes.length; i++) {
      const sectionNotes = notes[i].notes;
      const index = sectionNotes.findIndex((note) => note.id === noteId);
      if (index !== -1) {
        return [notes[i].id, index];
      }
    }
    return null;
  };

  const handleInputChange = (event, section) => {
    setInputValues({ ...inputValues, [section]: event.target.value });
  };

  const handleKeyPress = (event, section) => {
    if (event.key === 'Enter') {
      addNote(section);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (source.droppableId !== destination.droppableId) {
      const sourceSection = notes.find((note) => note.id === source.droppableId);
      const destinationSection = notes.find((note) => note.id === destination.droppableId);
      const [removed] = sourceSection.notes.splice(source.index, 1);
      destinationSection.notes.splice(destination.index, 0, removed);
      const updatedNotes = notes.map((note) => {
        if (note.id === sourceSection.id) {
          return sourceSection;
        }
        if (note.id === destinationSection.id) {
          return destinationSection;
        }
        return note;
      });
      setNotes(updatedNotes);
    } else {
      const section = notes.find((note) => note.id === source.droppableId);
      const items = reorder(section.notes, source.index, destination.index);
      const updatedNotes = notes.map((note) => {
        if (note.id === section.id) {
          return { ...note, notes: items };
        }
        return note;
      });
      setNotes(updatedNotes);
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleEditNoteChange = (event, noteId) => {
    const updatedNotes = notes.map((section) => {
      return {
        ...section,
        notes: section.notes.map((note) => {
          if (note.id === noteId) {
            return { ...note, content: event.target.value };
          }
          return note;
        }),
      };
    });
    setNotes(updatedNotes);
  };

  const handleEditSectionChange = (event, sectionId) => {
    const newContent = event.target.value;
    const updatedNotes = notes.map((section) => {
      if (section.id === sectionId) {
        return { ...section, name: newContent };
      }
      return section;
    });
    setNotes(updatedNotes);
  };
  
  const handleNoteBlur = (noteId) => {
    setEditingNoteId(null);
  };

  const handleEditKeyPress = (event, sectionId) => {
    if (event.key === 'Enter') {
      handleSectionBlur(event, sectionId);
    }
  };

  const handleSectionDoubleClick = (section) => {
    setEditingNoteId(section.id); // Edit the section name in-place
  };

  const handleSectionBlur = (event, sectionId) => {
    const newSectionName = event.target.value.trim();
    if (newSectionName && newSectionName !== sectionId) {
      const updatedNotes = notes.map((section) => {
        if (section.id === sectionId) {
          return { ...section, id: newSectionName, name: newSectionName };
        }
        return section;
      });
      setNotes(updatedNotes);
    }
    setEditingNoteId(null); // to exit editing mode
  };

  const deleteSection = (section) => {
    const updatedNotes = notes.filter((note) => note.id !== section);
    setNotes(updatedNotes);
  };

  const createNewSection = () => {
    setCreatingSection(true);
  };

  const handleCreateSection = () => {
    const newSectionName = inputValues.newSectionName;
    if (newSectionName && !notes.some((note) => note.id === newSectionName)) {
      const newSection = { id: newSectionName, name: newSectionName, notes: [] };
      const updatedNotes = [...notes, newSection];
      setNotes(updatedNotes);
      setInputValues({ ...inputValues, newSectionName: '' });
      setCreatingSection(false);
    }
  };

  const handleMinimizeSection = (sectionId) => {
    setMinimizedSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId], // Toggle the minimized state
    }));
  };

  const isSectionMinimized = (sectionId) => {
    return minimizedSections[sectionId] || false; // Default to false if section not in state
  };

  const renderNoteContent = (note) => {
    if (editingNoteId === note.id) {
      return (
        <input
          type="text"
          value={note.content}
          onChange={(event) => handleEditNoteChange(event, note.id)}
          onKeyPress={(event) => handleEditKeyPress(event, note.id)}
          onBlur={() => handleNoteBlur(note.id)}
          autoFocus
        />
      );
    }
    return (
      <span
        className="note-content"
        onDoubleClick={() => setEditingNoteId(note.id)}
      >
        {note.content}
      </span>
    );
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="appp">
        <header>
          <h1>Weekly Planner</h1>
        </header>
        {notes.map((section) => (
          <Droppable droppableId={section.id} key={section.id}>
            {(provided) => (
              <div className="note-section" {...provided.droppableProps} ref={provided.innerRef}>
                <div className="section-header">
                 
                  <h2 className="section-name" onDoubleClick={() => handleSectionDoubleClick(section)}>
                  <div className="section-title-container">
                    {editingNoteId === section.id ? (
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => handleEditSectionChange(e, section.id)}
                        onBlur={(e) => handleSectionBlur(e, section.id)}
                        onKeyPress={(e) => handleEditKeyPress(e, section.id)}
                        autoFocus
                      />
                    ) : (
                      section.name
                    )}
                  </div>
                  <span className="delete-section" onClick={() => deleteSection(section.id)}>
                    X
                  </span>
                </h2>
                  <span
                    className="collapse-button"
                    onClick={() => handleMinimizeSection(section.id)}
                  >
                    {isSectionMinimized(section.id) ? 'Show Notes' : 'Hide Notes'}
                  </span>
                </div>
                {!isSectionMinimized(section.id) && (
                  <div className="notes-container">
                    {section.notes.map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`note ${note.completed ? 'completed' : ''}`}
                            onClick={() => toggleComplete(note.id)}
                          >
                            {renderNoteContent(note)}
                            <span
                              className="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(section.id, note.id);
                              }}
                            >
                              X
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <input
                      type="text"
                      value={inputValues[section.id] || ''}
                      onChange={(e) => handleInputChange(e, section.id)}
                      onKeyPress={(e) => handleKeyPress(e, section.id)}
                      placeholder="Type a new note and press Enter"
                    />
                  </div>
                )}
              </div>
            )}
          </Droppable>
        ))}
        {creatingSection ? (
          <div className="note-section new-section">
            <div className="section-header">
              <span
                className="delete-section"
                onClick={() => setCreatingSection(false)}
              >
                X
              </span>
              <input
                type="text"
                value={inputValues.newSectionName}
                onChange={(e) => setInputValues({ ...inputValues, newSectionName: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateSection();
                }}
                placeholder="Enter section name"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <button className="add-section" onClick={createNewSection}>add more</button>
        )}
      </div>
    </DragDropContext>
  );
}


export default WeeklyPlanner;
