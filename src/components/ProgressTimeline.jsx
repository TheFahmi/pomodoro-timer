import React from 'react';
import { Box, Tooltip, Typography, useTheme, Paper, Divider, Chip } from '@mui/material';
import { styled } from '@mui/system';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const TimelineContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  overflowX: 'auto',
  padding: theme.spacing(1, 0),
}));

const TimelineLegend = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

const TimelineItem = styled(Box)(({ type, status, theme }) => ({
  height: 24,
  minWidth: type === 'work' ? 30 : 15,
  borderRadius: 4,
  margin: '0 2px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  backgroundColor: 
    status === 'completed' 
      ? (type === 'work' ? theme.palette.primary.main : theme.palette.secondary.main)
      : status === 'current' 
        ? (type === 'work' ? theme.palette.primary.light : theme.palette.secondary.light)
        : status === 'paused' 
          ? theme.palette.warning.light
          : theme.palette.action.disabledBackground,
  '&:hover': {
    transform: 'scale(1.1)',
    zIndex: 10,
  },
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
}));

const StatusIndicator = styled(Box)(({ color, theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: theme.spacing(0.5),
}));

const SessionTime = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: -20,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '0.65rem',
  whiteSpace: 'nowrap',
}));

const ProgressTimeline = ({ 
  sessions, 
  currentSessionIndex, 
  onSessionClick,
  showDetailedTime = false,
  compact = false
}) => {
  const theme = useTheme();

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'current': return 'Current';
      case 'paused': return 'Paused';
      default: return 'Upcoming';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircleOutlineIcon fontSize="small" />;
      case 'current': return <AccessTimeIcon fontSize="small" />;
      case 'paused': return <PauseCircleOutlineIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatTime = (minutes) => {
    return `${minutes}m`;
  };

  const getSessionStatus = (session, index) => {
    if (session.completed) return 'completed';
    if (index === currentSessionIndex) {
      return session.paused ? 'paused' : 'current';
    }
    return 'upcoming';
  };

  return (
    <TimelineContainer elevation={compact ? 0 : 3}>
      {!compact && (
        <TimelineHeader>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            Session Progress
          </Typography>
          <Chip 
            label={`${sessions.filter(s => s.completed).length}/${sessions.length} completed`} 
            size="small" 
            color="primary"
            icon={<CheckCircleOutlineIcon />}
          />
        </TimelineHeader>
      )}
      
      {!compact && <Divider sx={{ mb: 2 }} />}
      
      <TimelineContent>
        {sessions.map((session, index) => {
          const status = getSessionStatus(session, index);
          
          return (
            <Tooltip 
              key={index} 
              title={
                <React.Fragment>
                  <Typography variant="body2" fontWeight="bold">
                    {session.type === 'work' ? 'Work Session' : 'Break'} #{Math.ceil((index + 1) / 2)}
                  </Typography>
                  <Typography variant="body2">
                    Status: {getStatusLabel(status)}
                  </Typography>
                  <Typography variant="body2">
                    Duration: {formatTime(session.duration)}
                  </Typography>
                  {session.completed && session.actualDuration && (
                    <Typography variant="body2">
                      Actual: {formatTime(session.actualDuration)}
                    </Typography>
                  )}
                </React.Fragment>
              }
              arrow
              placement="top"
            >
              <Box sx={{ textAlign: 'center', mx: 1, position: 'relative' }}>
                <TimelineItem 
                  type={session.type} 
                  status={status}
                  theme={theme}
                  onClick={() => onSessionClick && onSessionClick(index)}
                  sx={{ 
                    width: session.type === 'work' ? 
                      (compact ? 20 : 30) : 
                      (compact ? 10 : 15),
                    height: compact ? 16 : 24,
                    border: status === 'current' ? `2px solid ${theme.palette.common.white}` : 'none',
                    boxShadow: status === 'current' ? 2 : 0,
                  }}
                />
                {showDetailedTime && (
                  <SessionTime variant="caption" color="textSecondary">
                    {formatTime(session.duration)}
                  </SessionTime>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </TimelineContent>
      
      {!compact && (
        <TimelineLegend>
          <LegendItem>
            <StatusIndicator color={theme.palette.primary.main} />
            <Typography variant="caption">Work</Typography>
          </LegendItem>
          <LegendItem>
            <StatusIndicator color={theme.palette.secondary.main} />
            <Typography variant="caption">Break</Typography>
          </LegendItem>
          <LegendItem>
            <StatusIndicator color={theme.palette.warning.light} />
            <Typography variant="caption">Paused</Typography>
          </LegendItem>
          <LegendItem>
            <StatusIndicator color={theme.palette.action.disabledBackground} />
            <Typography variant="caption">Upcoming</Typography>
          </LegendItem>
        </TimelineLegend>
      )}
    </TimelineContainer>
  );
};

export default ProgressTimeline;
