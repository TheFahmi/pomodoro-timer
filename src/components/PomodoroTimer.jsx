import React, { useState, useEffect, useRef } from 'react';
import Timer from './Timer';
import ProgressTimeline from './ProgressTimeline';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Button from '@mui/material/Button';
import { saveSession, getTodaySessions } from '../utils/sessionStorage';

const PomodoroTimer = ({ workDuration, breakDuration }) => {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [timerType, setTimerType] = useState('work');
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([
    { type: 'work', duration: workDuration, completed: false },
    { type: 'break', duration: breakDuration, completed: false },
    { type: 'work', duration: workDuration, completed: false },
    { type: 'break', duration: breakDuration, completed: false },
    { type: 'work', duration: workDuration, completed: false },
    { type: 'break', duration: breakDuration, completed: false },
    { type: 'work', duration: workDuration, completed: false },
    { type: 'break', duration: breakDuration, completed: false },
  ]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  const [sessionsHistory, setSessionsHistory] = useState([]);
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const todaySessions = getTodaySessions();
    setSessionsHistory(todaySessions);
  }, []);

  const handleStart = () => {
    setIsActive(true);
    startTimer();
  };

  const handlePause = () => {
    setIsActive(false);
    pauseTimer();
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(workDuration * 60);
    setTimerType('work');
    setCurrentSessionIndex(0);
    setSessions(sessions.map(session => ({ ...session, completed: false })));
  };

  const startTimer = () => {
    const newSession = {
      id: Date.now(),
      type: timerType,
      duration: timerType === 'work' ? workDuration : breakDuration,
      active: true,
      paused: false,
      timestamp: new Date().toISOString(),
      tasks: [] // Add tasks if you have them
    };
    
    setCurrentSessionData(newSession);
    setSessionStartTime(new Date());
    setPauseCount(0);
    
    const savedSession = saveSession(newSession);
    setSessionsHistory([...sessionsHistory, savedSession]);
  };

  const pauseTimer = () => {
    if (currentSessionData) {
      const updatedSession = {
        ...currentSessionData,
        paused: true,
        pauseCount: (currentSessionData.pauseCount || 0) + 1
      };
      setCurrentSessionData(updatedSession);
      setPauseCount(pauseCount + 1);
      
      const savedSession = saveSession(updatedSession);
      
      const updatedHistory = sessionsHistory.map(session => 
        session.id === savedSession.id ? savedSession : session
      );
      setSessionsHistory(updatedHistory);
    }
  };

  const resumeTimer = () => {
    if (currentSessionData) {
      const updatedSession = {
        ...currentSessionData,
        paused: false
      };
      setCurrentSessionData(updatedSession);
      
      const savedSession = saveSession(updatedSession);
      
      const updatedHistory = sessionsHistory.map(session => 
        session.id === savedSession.id ? savedSession : session
      );
      setSessionsHistory(updatedHistory);
    }
  };

  const handleComplete = () => {
    if (currentSessionData) {
      const sessionEndTime = new Date();
      const actualDurationMs = sessionEndTime - new Date(sessionStartTime);
      const actualDurationMinutes = Math.round(actualDurationMs / (1000 * 60));
      
      const completedSession = {
        ...currentSessionData,
        completed: true,
        active: false,
        paused: false,
        endTimestamp: sessionEndTime.toISOString(),
        actualDuration: actualDurationMinutes,
        pauseCount
      };
      
      const savedSession = saveSession(completedSession);
      
      const updatedHistory = sessionsHistory.map(session => 
        session.id === savedSession.id ? savedSession : session
      );
      setSessionsHistory(updatedHistory);
      
      setCurrentSessionData(null);
    }
    
    if (audioRef.current) {
      audioRef.current.play();
    }
    
    setTimerType(timerType === 'work' ? 'break' : 'work');
    setTimeLeft(timerType === 'work' ? breakDuration * 60 : workDuration * 60);
    setIsActive(false);
    setPauseCount(0);
  };

  return (
    <div>
      <Timer 
        timeLeft={timeLeft} 
        timerType={timerType} 
        isActive={isActive} 
        onStart={handleStart} 
        onPause={handlePause} 
        onReset={handleReset} 
      />
      <ProgressTimeline 
        sessions={sessions} 
        currentSessionIndex={currentSessionIndex} 
      />
      <Box sx={{ width: '100%', mt: 3 }}>
        <ProgressTimeline 
          sessions={sessionsHistory}
          currentSessionIndex={sessionsHistory.findIndex(s => s.active)}
          compact={true}
        />
      </Box>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AssessmentIcon />}
        onClick={() => navigate('/details')}
        sx={{ mt: 2 }}
      >
        View Detailed Progress
      </Button>
      <audio ref={audioRef} src="notification.mp3" />
    </div>
  );
};

export default PomodoroTimer;