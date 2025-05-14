import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  CircularProgress,
  Avatar,
  Chip,
  Button,
  alpha
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  Pending,
  Cancel,
  Timeline,
  LocalHospital,
  SportsTennis,
  Description,
  Assignment,
  Announcement,
  AccessTime,
  Today,
  TrendingUp,
  ArrowForward
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import API_BASE_URL from '../../config';

// Date formatter
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const QuickStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    mostActiveService: '',
    recentActivity: []
  });
  
  const theme = useTheme();
  const navigate = useNavigate();

  const handleViewAllActivity = () => {
    navigate('/admin/logs'); // Adjust this path to match your actual logs page route
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Create fetch options with credentials to send cookies
      const fetchOptions = {
        method: 'GET',
        credentials: 'include', // Important: This sends cookies with the request
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Fetch all types of requests to aggregate for dashboard
      const [ambulanceRes, courtRes, docRes, reportRes, proposalRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ambulance`, fetchOptions),
        fetch(`${API_BASE_URL}/court`, fetchOptions),
        fetch(`${API_BASE_URL}/documents`, fetchOptions),
        fetch(`${API_BASE_URL}/reports`, fetchOptions),
        fetch(`${API_BASE_URL}/proposals`, fetchOptions),
        fetch(`${API_BASE_URL}/logs?limit=10`, fetchOptions) // Get 10 recent logs for more choices
      ]);
      
      // Check if any requests failed due to auth issues
      if (!ambulanceRes.ok || !courtRes.ok || !docRes.ok || !reportRes.ok || !proposalRes.ok) {
        console.error('Authentication error or API endpoint issue');
        setLoading(false);
        return;
      }
      
      // Parse the JSON responses
      const ambulanceData = await ambulanceRes.json();
      const courtData = await courtRes.json();
      const docData = await docRes.json();
      const reportData = await reportRes.json();
      const proposalData = await proposalRes.json();
      const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };

      console.log('Fetched data:', {
        ambulance: ambulanceData,
        court: courtData,
        docs: docData,
        reports: reportData,
        proposals: proposalData,
        logs: logsData
      });
      
      // Calculate total requests
      const totalAmbulance = Array.isArray(ambulanceData) ? ambulanceData.length : 0;
      const totalCourt = Array.isArray(courtData) ? courtData.length : 0;
      const totalDocs = docData && docData.documentRequests ? docData.documentRequests.length : 0;
      const totalReports = reportData && reportData.reports ? reportData.reports.length : 0;
      const totalProposals = proposalData && proposalData.proposals ? proposalData.proposals.length : 0;
      
      const totalRequests = totalAmbulance + totalCourt + totalDocs + totalReports + totalProposals;
      
      // Calculate pending requests - be defensive with data access
      const pendingAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && item.status === 'Pending').length 
        : 0;
      
      const pendingProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingRequests = pendingAmbulance + pendingCourt + pendingDocs + pendingReports + pendingProposals;
      
      // Calculate approved/completed requests
      const approvedAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && ['booked', 'completed'].includes(item.status)).length 
        : 0;
      
      const approvedCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && item.status === 'approved').length 
        : 0;
      
      const approvedDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && ['in_progress', 'completed'].includes(item.status)).length 
        : 0;
      
      const approvedReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && ['In Progress', 'Resolved'].includes(item.status)).length 
        : 0;
      
      const approvedProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && ['in_review', 'considered', 'approved'].includes(item.status)).length 
        : 0;
      
      const approvedRequests = approvedAmbulance + approvedCourt + approvedDocs + approvedReports + approvedProposals;
      
      // Calculate rejected/cancelled requests
      const rejectedAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && item.status === 'cancelled').length 
        : 0;
      
      const rejectedCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && ['rejected', 'cancelled'].includes(item.status)).length 
        : 0;
      
      const rejectedDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && ['rejected', 'cancelled'].includes(item.status)).length 
        : 0;
      
      const rejectedReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && item.status === 'Cancelled').length 
        : 0;
      
      const rejectedProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && item.status === 'rejected').length 
        : 0;
      
      const rejectedRequests = rejectedAmbulance + rejectedCourt + rejectedDocs + rejectedReports + rejectedProposals;
      
      // Determine most active service
      const serviceCounts = [
        { name: 'Ambulance Bookings', count: totalAmbulance },
        { name: 'Court Reservations', count: totalCourt },
        { name: 'Document Requests', count: totalDocs },
        { name: 'Infrastructure Reports', count: totalReports },
        { name: 'Project Proposals', count: totalProposals }
      ];
      
      // Sort services by count for debugging
      console.log('Service counts sorted:', [...serviceCounts].sort((a, b) => b.count - a.count));
      
      const mostActiveService = serviceCounts.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current, { name: 'None', count: 0 }
      ).name;
      
      console.log('Most active service calculated:', mostActiveService);
      
      // Process recent activity - if logs API is available, use that
      let recentActivity = [];
      
      if (logsData && Array.isArray(logsData.logs) && logsData.logs.length > 0) {
        // Use actual logs if available
        recentActivity = logsData.logs.map(log => ({
          type: log.entityType || 'Activity',
          status: log.action || 'Updated',
          date: new Date(log.timestamp || log.createdAt),
          details: log.details || 'System activity'
        })).slice(0, 5);
        
        console.log('Using real logs for activity:', recentActivity);
      } else {
        // If no logs, aggregate recent items from other services
        const allItems = [];
        
        // Add recent ambulance bookings
        if (Array.isArray(ambulanceData)) {
          ambulanceData.forEach(booking => {
            if (booking && booking.createdAt) {
              allItems.push({
                type: 'Ambulance Booking',
                status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
                date: new Date(booking.createdAt),
                details: `Patient: ${booking.patientName || 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent court reservations
        if (Array.isArray(courtData)) {
          courtData.forEach(reservation => {
            if (reservation && reservation.createdAt) {
              allItems.push({
                type: 'Court Reservation',
                status: reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1),
                date: new Date(reservation.createdAt),
                details: `By: ${reservation.representativeName || 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent document requests
        if (docData && docData.documentRequests && Array.isArray(docData.documentRequests)) {
          docData.documentRequests.forEach(doc => {
            if (doc && doc.createdAt) {
              allItems.push({
                type: 'Document Request',
                status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace('_', ' '),
                date: new Date(doc.createdAt),
                details: `Type: ${doc.documentType ? doc.documentType.replace('_', ' ') : 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent reports
        if (reportData && reportData.reports && Array.isArray(reportData.reports)) {
          reportData.reports.forEach(report => {
            if (report && report.createdAt) {
              allItems.push({
                type: 'Infrastructure Report',
                status: report.status || 'Submitted',
                date: new Date(report.createdAt),
                details: `Issue: ${report.issueType || 'General'}`
              });
            }
          });
        }
        
        // Add recent proposals
        if (proposalData && proposalData.proposals && Array.isArray(proposalData.proposals)) {
          proposalData.proposals.forEach(proposal => {
            if (proposal && proposal.createdAt) {
              allItems.push({
                type: 'Project Proposal',
                status: proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1).replace('_', ' '),
                date: new Date(proposal.createdAt),
                details: `Project: ${proposal.projectTitle || 'Untitled'}`
              });
            }
          });
        }
        
        console.log('All collected recent items:', allItems.length);
        
        // Sort all items by date (newest first) and take the first 5
        recentActivity = allItems
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        
        console.log('Processed recent activity:', recentActivity);
        
      }
      
      // Add this debug log right before setting the state
      console.log('Final stats being set:', {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        mostActiveService,
        recentActivity: recentActivity.length
      });
      
      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        mostActiveService,
        recentActivity
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Debug logging when stats change
  useEffect(() => {
    console.log('Stats updated:', {
      mostActiveService: stats.mostActiveService,
      recentActivity: stats.recentActivity.length
    });
  }, [stats]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Debug logs during render
  console.log('RENDER DATA:', {
    mostActiveService: stats.mostActiveService,
    recentActivityCount: stats.recentActivity.length,
    firstActivity: stats.recentActivity[0]
  });
  
  const statCards = [
    {
      title: 'Total Service Requests',
      value: stats.totalRequests,
      icon: <Assessment fontSize="large" color="primary" />,
      color: 'primary.main'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: <Pending fontSize="large" color="warning" />,
      color: 'warning.main'
    },
    {
      title: 'Approved/Completed',
      value: stats.approvedRequests,
      icon: <CheckCircle fontSize="large" color="success" />,
      color: 'success.main'
    },
    {
      title: 'Rejected/Cancelled',
      value: stats.rejectedRequests,
      icon: <Cancel fontSize="large" color="error" />,
      color: 'error.main'
    }
  ];
  
  return (
    <ThemeProvider theme={theme}>
  <Box sx={{ mb: 4 }}>
    {/* Header Section */}
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Assessment sx={{ mr: 1.5, color: 'primary.main' }} />
        Service Overview
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          borderRadius: 2,
          px: 2,
          py: 0.5
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Timeline sx={{ fontSize: '0.875rem', mr: 0.5, color: 'primary.main' }} />
          Last updated: {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
        </Typography>
      </Box>
    </Box>

    {/* Main Stats Section */}
    <Grid container spacing={3}>
      {/* Stats Cards */}
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
              }
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => alpha(theme.palette[card.color.split('.')[0]].main, 0.1), 
                    color: card.color,
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  {card.icon}
                </Avatar>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'text.secondary'
                  }}
                >
                  {card.title}
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                component="div" 
                color={card.color}
                sx={{ 
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  mt: 'auto', 
                  fontSize: { xs: '1.75rem', md: '2rem' }
                }}
              >
                {card.value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {/* Most Active Service */}
      <Grid item xs={12} sm={6} md={4}>
        <Card 
          sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1), 
                  color: 'info.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <Timeline sx={{ fontSize: '1.2rem' }} />
              </Avatar>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'text.secondary'
                }}
              >
                Most Active Service
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography 
                variant="h5" 
                component="div" 
                color="info.main"
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {
                  stats.mostActiveService === 'Ambulance Bookings' ? 
                    <><LocalHospital sx={{ mr: 1 }} /> {stats.mostActiveService}</> :
                  stats.mostActiveService === 'Court Reservations' ? 
                    <><SportsTennis sx={{ mr: 1 }} /> {stats.mostActiveService}</> :
                  stats.mostActiveService === 'Document Requests' ? 
                    <><Description sx={{ mr: 1 }} /> {stats.mostActiveService}</> :
                  stats.mostActiveService === 'Infrastructure Reports' ? 
                    <><Assignment sx={{ mr: 1 }} /> {stats.mostActiveService}</> : 
                  stats.mostActiveService === 'Project Proposals' ? 
                    <><Announcement sx={{ mr: 1 }} /> {stats.mostActiveService}</> :
                    <>{stats.mostActiveService}</>
                }
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2,
                fontSize: '0.75rem',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <TrendingUp sx={{ fontSize: '0.875rem', mr: 0.5, color: 'success.main' }} />
              Based on total number of service requests
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Recent Activity */}
      <Grid item xs={12} sm={6} md={8}>
        <Card 
          sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            },
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ height: '100%', p: 0 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.03),
              display: 'flex',
              alignItems: 'center'
            }}>
              <AccessTime sx={{ color: 'primary.main', mr: 1.5 }} />
              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Recent Activity
              </Typography>
            </Box>
            
            <Box sx={{ p: 2 }}>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between', 
                      mb: 2,
                      pb: 2,
                      borderBottom: index < stats.recentActivity.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      maxWidth: '40%'
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 1.5,
                          bgcolor: 
                            activity.type.includes('Ambulance') ? 'info.light' : 
                            activity.type.includes('Court') ? 'success.light' :
                            activity.type.includes('Document') ? 'warning.light' :
                            activity.type.includes('Report') ? 'error.light' :
                            'secondary.light'
                        }}
                      >
                        {
                          activity.type.includes('Ambulance') ? <LocalHospital fontSize="small" /> :
                          activity.type.includes('Court') ? <SportsTennis fontSize="small" /> :
                          activity.type.includes('Document') ? <Description fontSize="small" /> :
                          activity.type.includes('Report') ? <Assignment fontSize="small" /> :
                          <Announcement fontSize="small" />
                        }
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {activity.type}
                        <Typography 
                          variant="caption" 
                          component="div" 
                          color="text.secondary"
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          {activity.details}
                        </Typography>
                      </Typography>
                    </Box>
                    <Chip 
                      label={activity.status}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        backgroundColor: 
                          activity.status === 'Completed' || activity.status === 'Approved' || activity.status === 'Resolved' ? alpha(theme.palette.success.main, 0.1) :
                          activity.status === 'Pending' ? alpha(theme.palette.warning.main, 0.1) :
                          activity.status === 'In Progress' || activity.status === 'Considered' || activity.status === 'In Review' || activity.status === 'Booked' ? alpha(theme.palette.info.main, 0.1) :
                          alpha(theme.palette.error.main, 0.1),
                        color: 
                          activity.status === 'Completed' || activity.status === 'Approved' || activity.status === 'Resolved' ? 'success.main' :
                          activity.status === 'Pending' ? 'warning.main' :
                          activity.status === 'In Progress' || activity.status === 'Considered' || activity.status === 'In Review' || activity.status === 'Booked' ? 'info.main' :
                          'error.main',
                      }}
                    />
                    
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 500
                      }}
                    >
                      <Today fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                      {formatDate(activity.date)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress size={28} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent activity found
                  </Typography>
                </Box>
              )}
              
              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    pt: 2, 
                    textAlign: 'center',
                    borderTop: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Button 
                    variant="text" 
                    color="primary" 
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={handleViewAllActivity}
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    View All Activity
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
  </ThemeProvider>
);
}

export default QuickStats;