import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Grid,
  LinearProgress,
  useTheme
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SpeedIcon from '@mui/icons-material/Speed';
import LoopIcon from '@mui/icons-material/Loop';

const StatCard = ({ title, value, icon, color, secondaryValue }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: '100%',
        borderTop: `4px solid ${theme.palette[color].main}`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {secondaryValue && (
            <Typography variant="body2" color="text.secondary">
              {secondaryValue}
            </Typography>
          )}
        </Box>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: '50%', 
            backgroundColor: theme.palette[color].light,
            color: theme.palette[color].dark
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const SessionAnalytics = ({ sessions, date }) => {
  const theme = useTheme();
  
  // Calculate statistics
  const workSessions = sessions.filter(s => s.type === 'work');
  const completedWorkSessions = workSessions.filter(s => s.completed);
  const totalWorkTime = workSessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  const completedWorkTime = completedWorkSessions.reduce((total, session) => {
    return total + (session.actualDuration || session.duration || 0);
  }, 0);
  
  const completionRate = workSessions.length > 0 
    ? (completedWorkSessions.length / workSessions.length) * 100 
    : 0;
  
  const breakSessions = sessions.filter(s => s.type === 'break');
  const completedBreakSessions = breakSessions.filter(s => s.completed);
  
  // Calculate focus score (0-100) based on completion rate and pauses
  const calculateFocusScore = () => {
    if (completedWorkSessions.length === 0) return 0;
    
    const pauseDeductions = completedWorkSessions.reduce((total, session) => {
      return total + (session.pauseCount || 0) * 5; // Deduct 5 points per pause
    }, 0);
    
    // Base score is completion rate
    let score = completionRate;
    // Deduct for pauses, but don't go below 0
    score = Math.max(0, score - pauseDeductions);
    
    return Math.round(score);
  };

  const focusScore = calculateFocusScore();
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Analytics for {date ? formatDate(date) : 'Today'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completed Sessions"
            value={`${completedWorkSessions.length}/${workSessions.length}`}
            icon={<CheckCircleOutlineIcon />}
            color="success"
            secondaryValue={`${completionRate.toFixed(0)}% completion rate`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Focus Time"
            value={`${completedWorkTime}m`}
            icon={<AccessTimeFilledIcon />}
            color="primary"
            secondaryValue={`out of ${totalWorkTime}m planned`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Focus Score"
            value={focusScore}
            icon={<SpeedIcon />}
            color={focusScore > 75 ? "success" : focusScore > 50 ? "warning" : "error"}
            secondaryValue={
              focusScore > 75 ? "Excellent focus!" : 
              focusScore > 50 ? "Good focus" : 
              "Needs improvement"
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Work/Break Cycles"
            value={`${completedWorkSessions.length}/${Math.ceil(workSessions.length/2)}`}
            icon={<LoopIcon />}
            color="secondary"
            secondaryValue={`${completedBreakSessions.length} breaks taken`}
          />
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Work/Break Balance</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 100 }}>Work Time:</Typography>
          <Box sx={{ width: '100%', ml: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={(completedWorkTime / (completedWorkTime + completedBreakSessions.reduce((t, s) => t + s.duration, 0))) * 100} 
              color="primary"
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" sx={{ ml: 2, minWidth: 40 }}>
            {completedWorkTime}m
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ minWidth: 100 }}>Break Time:</Typography>
          <Box sx={{ width: '100%', ml: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              color="secondary"
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" sx={{ ml: 2, minWidth: 40 }}>
            {completedBreakSessions.reduce((t, s) => t + s.duration, 0)}m
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SessionAnalytics;
