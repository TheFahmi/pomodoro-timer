import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WorkIcon from '@mui/icons-material/Work';
import TimerIcon from '@mui/icons-material/Timer';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const SessionDetails = ({ 
  session, 
  sessionNumber, 
  totalSessions,
  onActionClick,
  expanded = false 
}) => {
  // Format time as MM:SS
  const formatTime = (minutes) => {
    return `${minutes}:00`;
  };

  const calculateProgressPercent = () => {
    if (session.completed) return 100;
    if (!session.elapsed) return 0;
    return Math.round((session.elapsed / (session.duration * 60)) * 100);
  };

  const getStatusColor = () => {
    if (session.completed) return "success";
    if (session.paused) return "warning";
    if (session.active) return "primary";
    return "default";
  };

  const getStatusLabel = () => {
    if (session.completed) return "Completed";
    if (session.paused) return "Paused";
    if (session.active) return "In Progress";
    return "Pending";
  };

  const getStatusIcon = () => {
    if (session.completed) return <CheckCircleIcon />;
    if (session.paused) return <PauseIcon />;
    if (session.active) return <PlayArrowIcon />;
    return <PendingIcon />;
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton sx={{ mr: 1, backgroundColor: session.type === 'work' ? 'primary.light' : 'secondary.light' }}>
              {session.type === 'work' ? <WorkIcon /> : <DirectionsRunIcon />}
            </IconButton>
            <Typography variant="h6">
              {session.type === 'work' ? 'Work Session' : 'Break'} {Math.ceil(sessionNumber / 2)}
            </Typography>
          </Box>
          <Chip 
            label={getStatusLabel()}
            color={getStatusColor()}
            icon={getStatusIcon()}
            size="medium"
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Planned Duration</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TimerIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{formatTime(session.duration)}</Typography>
              </Box>
            </Paper>
          </Grid>
          {session.completed && session.actualDuration && (
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Actual Duration</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <AccessTimeIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{formatTime(session.actualDuration)}</Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {session.active && !session.completed && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{calculateProgressPercent()}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgressPercent()} 
              color={session.type === 'work' ? 'primary' : 'secondary'} 
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}
        
        {(session.active || session.paused) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
            <Tooltip title={session.paused ? "Resume Session" : "Pause Session"}>
              <IconButton 
                color="primary" 
                onClick={() => onActionClick && onActionClick(session.paused ? 'resume' : 'pause')}
                size="large"
              >
                {session.paused ? <PlayArrowIcon /> : <PauseIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Skip Session">
              <IconButton 
                color="secondary" 
                onClick={() => onActionClick && onActionClick('skip')}
                size="large"
              >
                <SkipNextIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        {session.type === 'work' && expanded && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Tasks for this session:</Typography>
            {session.tasks && session.tasks.length > 0 ? (
              <List dense>
                {session.tasks.map((task, idx) => (
                  <ListItem key={idx} dense>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {task.completed ? <CheckCircleIcon fontSize="small" color="success" /> : <PendingIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={task.title} 
                      sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tasks assigned to this session.
              </Typography>
            )}
          </Box>
        )}
        
        {!expanded && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Tooltip title="Show more details">
              <IconButton size="small" onClick={() => onActionClick && onActionClick('expand')}>
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          {session.type === 'work' ? (
            "Focus on one task at a time for maximum productivity."
          ) : (
            "Take a real break: step away from the screen and refresh your mind."
          )}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SessionDetails;
