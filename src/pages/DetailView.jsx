import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import ProgressTimeline from '../components/ProgressTimeline';
import SessionDetails from '../components/SessionDetails';
import SessionAnalytics from '../components/SessionAnalytics';
import { formatDate, parseDate, addDays } from '../utils/dateUtils';
import { getSessionHistoryForDate } from '../utils/sessionStorage';

const DetailView = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [expandedSession, setExpandedSession] = useState(null);
  
  // This would normally be fetched from storage
  const [sessions, setSessions] = useState([
    { 
      id: 1,
      type: 'work', 
      duration: 25, 
      actualDuration: 27, 
      completed: true,
      timestamp: new Date(new Date().setHours(9, 0, 0)).toISOString(),
      pauseCount: 1,
      tasks: [
        { id: 1, title: 'Implement user dashboard', completed: true },
        { id: 2, title: 'Fix login screen bugs', completed: true }
      ]
    },
    { 
      id: 2,
      type: 'break', 
      duration: 5, 
      actualDuration: 5, 
      completed: true,
      timestamp: new Date(new Date().setHours(9, 27, 0)).toISOString(),
    },
    { 
      id: 3,
      type: 'work', 
      duration: 25, 
      actualDuration: 25, 
      completed: true,
      timestamp: new Date(new Date().setHours(9, 32, 0)).toISOString(),
      pauseCount: 0,
      tasks: [
        { id: 3, title: 'Improve API response time', completed: true }
      ]
    },
    { 
      id: 4,
      type: 'break', 
      duration: 5, 
      actualDuration: 7, 
      completed: true,
      timestamp: new Date(new Date().setHours(9, 57, 0)).toISOString(),
    },
    { 
      id: 5,
      type: 'work', 
      duration: 25, 
      active: true,
      elapsed: 1200, // 20 mins in seconds
      timestamp: new Date(new Date().setHours(10, 4, 0)).toISOString(),
      pauseCount: 0,
      tasks: [
        { id: 4, title: 'Refactor authentication module', completed: false }
      ]
    },
    { 
      id: 6,
      type: 'break', 
      duration: 5, 
      timestamp: new Date(new Date().setHours(10, 29, 0)).toISOString(),
    },
    { 
      id: 7,
      type: 'work', 
      duration: 25,
      timestamp: new Date(new Date().setHours(10, 34, 0)).toISOString(),
      tasks: []
    },
    { 
      id: 8,
      type: 'break', 
      duration: 15,
      timestamp: new Date(new Date().setHours(10, 59, 0)).toISOString(),
    },
  ]);
  
  useEffect(() => {
    // This would normally load sessions from storage based on the selected date
    // const loadedSessions = getSessionHistoryForDate(selectedDate);
    // if (loadedSessions && loadedSessions.length > 0) {
    //   setSessions(loadedSessions);
    // }
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  const navigateDate = (direction) => {
    const newDate = addDays(new Date(selectedDate), direction);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleTimelineClick = (index) => {
    setSelectedSessionIndex(index);
    setExpandedSession(null);
  };
  
  const handleSessionAction = (sessionId, action) => {
    if (action === 'expand') {
      setExpandedSession(sessionId);
    }
    // Other actions would be handled here (pause, resume, skip)
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Timer
        </Button>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 3
          }}>
            <Typography variant="h4" component="h1" gutterBottom={isMobile}>
              Session Details
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mt: isMobile ? 2 : 0
            }}>
              <IconButton onClick={() => navigateDate(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              
              <TextField
                value={selectedDate}
                onChange={handleDateChange}
                type="date"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mx: 1 }}
              />
              
              <IconButton onClick={() => navigateDate(1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          
          <ProgressTimeline 
            sessions={sessions} 
            currentSessionIndex={sessions.findIndex(s => s.active)}
            onSessionClick={handleTimelineClick}
            showDetailedTime={true}
          />
        </Paper>
        
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Sessions" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>
        
        {selectedTab === 0 && (
          <Box>
            <SessionDetails 
              session={sessions[selectedSessionIndex]} 
              sessionNumber={selectedSessionIndex + 1}
              totalSessions={sessions.length}
              onActionClick={(action) => handleSessionAction(sessions[selectedSessionIndex].id, action)}
              expanded={expandedSession === sessions[selectedSessionIndex].id}
            />
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              All Sessions
            </Typography>
            
            <Grid container spacing={2}>
              {sessions.map((session, index) => (
                <Grid item xs={12} sm={6} md={4} key={session.id}>
                  <SessionDetails 
                    session={session} 
                    sessionNumber={index + 1}
                    totalSessions={sessions.length}
                    onActionClick={(action) => handleSessionAction(session.id, action)}
                    expanded={false}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {selectedTab === 1 && (
          <SessionAnalytics 
            sessions={sessions}
            date={selectedDate}
          />
        )}
      </Box>
    </Container>
  );
};

export default DetailView;
