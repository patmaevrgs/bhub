import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { MoreVert, Description, LocalHospital, SportsTennis, Assignment, Announcement, FormatListBulleted } from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { alpha } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Campaign as AnnouncementsIcon,
  Build as ServicesIcon,
  People as PeopleAlt,
  People as PeopleAltIcon,
  ManageAccounts as AccountsIcon,
  History as LogsIcon,
  Menu as MenuIcon,
  Article as FormsIcon,
  LocalHospital as AmbulanceIcon,
  SportsBasketball as CourtIcon,
  Construction as InfraIcon,
  Assignment as ProjectIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DonutLarge as DonutLargeIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Summarize as SummarizeIcon,
  Pending as PendingIcon,
  CalendarMonth as CalendarMonthIcon,
  Percent as PercentIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  HowToVote as HowToVoteIcon,
  Event as EventIcon,
  VerifiedUser as VerifiedUserIcon,
  PendingActions as PendingActionsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import API_BASE_URL from '../../../config';

// Utility function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Utility function to format time
const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString('en-US', options);
};

// Utility function for date range
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { 
    startDate: start.toISOString().split('T')[0], 
    endDate: end.toISOString().split('T')[0] 
  };
};

const AdminDashboard = () => {
    // State variables for data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [timeRange, setTimeRange] = useState(30); // Default to 30 days
    const [anchorEl, setAnchorEl] = useState(null);
    const [documentTypeDistribution, setDocumentTypeDistribution] = useState([]);
    const [reportIssueTypes, setReportIssueTypes] = useState([]);
    const [totalDocRequests, setTotalDocRequests] = useState(0);
    const [reportStats, setReportStats] = useState({
    averageResolutionTime: '0.0',
    resolvedCount: 0
    });

  // Statistics state
    const [stats, setStats] = useState({
        todayRequests: 0,
        residentCount: 0
    });
    
    // Data for service-specific analytics
    const [serviceData, setServiceData] = useState({
        ambulance: { total: 0, pending: 0, booked: 0, completed: 0, cancelled: 0 },
        court: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
        documents: { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 },
        reports: { total: 0, pending: 0, inProgress: 0, resolved: 0, cancelled: 0 },
        proposals: { total: 0, pending: 0, inReview: 0, considered: 0, approved: 0, rejected: 0 }
    });
    
    // Time series data
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [serviceDistribution, setServiceDistribution] = useState([]);
    const [requestTrends, setRequestTrends] = useState([]);
    
    // Recent activity data
    const [recentActivity, setRecentActivity] = useState([]);
    
    // Resident data
    const [residentTypes, setResidentTypes] = useState([]);
    const [residentRegistrationTrends, setResidentRegistrationTrends] = useState([]);

    const theme = useTheme();
    // Menu handling
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Tab handling
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Time range handling
    const handleTimeRangeChange = (event) => {
        setTimeRange(parseInt(event.target.value));
        fetchData(parseInt(event.target.value));
    };

  // Fix for the dashboard data loading error
// Moving the residents variable initialization before it's used in setStats

// Complete fixed fetchData function with error handling
const fetchData = async (days = 30) => {
  setLoading(true);
  setError(null);
  
  try {
    const { startDate, endDate } = getDateRange(days);
    
    // Create fetch options with credentials to send cookies
    const fetchOptions = {
      method: 'GET',
      credentials: 'include', // Important: This sends cookies with the request
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Fetch all data using Promise.all for better performance
    let responses;
    try {
      console.log('Fetching data with date range:', { startDate, endDate });
      
      responses = await Promise.all([
        fetch(`${API_BASE_URL}/ambulance?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
        fetch(`${API_BASE_URL}/court?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
        // Remove date parameters from these endpoints
        fetch(`${API_BASE_URL}/documents`, fetchOptions),
        fetch(`${API_BASE_URL}/reports`, fetchOptions),
        fetch(`${API_BASE_URL}/proposals`, fetchOptions),
        fetch(`${API_BASE_URL}/residents?limit=200000`, fetchOptions),
        fetch(`${API_BASE_URL}/logs?limit=10`, fetchOptions)
      ]);
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError);
      throw new Error('Network error when fetching data');
    }
    
    const [
      ambulanceRes, 
      courtRes, 
      docRes, 
      reportRes, 
      proposalRes, 
      residentRes,
      logsRes
    ] = responses;
    
    // Parse all response data with proper error handling
    let ambulanceData, courtData, docData, reportData, proposalData, residentData, logsData;
    
    try {
      // Process ambulance and court data with server-side filtering
      ambulanceData = ambulanceRes.ok ? await ambulanceRes.json() : [];
      courtData = courtRes.ok ? await courtRes.json() : [];
      
      // Process document requests with client-side filtering
      if (docRes.ok) {
        const docJson = await docRes.json();
        
        // Apply client-side date filtering to document requests
        if (startDate && endDate && docJson && docJson.documentRequests && Array.isArray(docJson.documentRequests)) {
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(endDate);
          // Add one day to end date to make it inclusive
          endDateObj.setDate(endDateObj.getDate() + 1);
          
          console.log('Filtering document requests from', startDateObj, 'to', endDateObj);
          console.log('Before filtering:', docJson.documentRequests.length, 'document requests');
          
          docJson.documentRequests = docJson.documentRequests.filter(doc => {
            if (!doc || !doc.createdAt) return false;
            const docDate = new Date(doc.createdAt);
            return docDate >= startDateObj && docDate < endDateObj;
          });
          
          console.log('After filtering:', docJson.documentRequests.length, 'document requests');
        }
        
        docData = docJson;
      } else {
        docData = { documentRequests: [] };
      }
      
      // Process report data with client-side filtering
      if (reportRes.ok) {
        const reportJson = await reportRes.json();
        
        // Apply client-side date filtering to reports
        if (startDate && endDate && reportJson && reportJson.reports && Array.isArray(reportJson.reports)) {
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(endDate);
          // Add one day to end date to make it inclusive
          endDateObj.setDate(endDateObj.getDate() + 1);
          
          console.log('Filtering reports from', startDateObj, 'to', endDateObj);
          console.log('Before filtering:', reportJson.reports.length, 'reports');
          
          reportJson.reports = reportJson.reports.filter(report => {
            if (!report || !report.createdAt) return false;
            const reportDate = new Date(report.createdAt);
            return reportDate >= startDateObj && reportDate < endDateObj;
          });
          
          console.log('After filtering:', reportJson.reports.length, 'reports');
        }
        
        reportData = reportJson;
      } else {
        reportData = { reports: [] };
      }
      
      // Process proposal data with client-side filtering
      if (proposalRes.ok) {
        try {
          const proposalJson = await proposalRes.json();
          console.log('Raw proposal response:', proposalJson);
          
          // Determine the structure of proposal data
          let proposals = [];
          if (proposalJson && proposalJson.proposals && Array.isArray(proposalJson.proposals)) {
            proposals = proposalJson.proposals;
          } else if (proposalJson && Array.isArray(proposalJson)) {
            proposals = proposalJson;
          } else if (proposalJson && proposalJson.success && proposalJson.data && Array.isArray(proposalJson.data)) {
            proposals = proposalJson.data;
          }
          
          console.log('Identified proposals array with length:', proposals.length);
          
          // Apply client-side date filtering to proposals
          if (startDate && endDate && proposals.length > 0) {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            // Add one day to end date to make it inclusive
            endDateObj.setDate(endDateObj.getDate() + 1);
            
            console.log('Filtering proposals from', startDateObj, 'to', endDateObj);
            console.log('Before filtering:', proposals.length, 'proposals');
            
            proposals = proposals.filter(proposal => {
              if (!proposal || !proposal.createdAt) return false;
              try {
                const proposalDate = new Date(proposal.createdAt);
                return proposalDate >= startDateObj && proposalDate < endDateObj;
              } catch (dateError) {
                console.error('Error parsing proposal date:', dateError);
                return false;
              }
            });
            
            console.log('After filtering:', proposals.length, 'proposals');
          }
          
          proposalData = { proposals: proposals };
        } catch (parseError) {
          console.error('Error parsing proposal response:', parseError);
          proposalData = { proposals: [] };
        }
      } else {
        console.error('Proposal fetch failed:', proposalRes.status, proposalRes.statusText);
        proposalData = { proposals: [] };
      }
      
      console.log('Processed proposal data:', proposalData);
      
      residentData = residentRes.ok ? await residentRes.json() : { data: [] };
      logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
    } catch (parseError) {
      console.error('Error parsing response data:', parseError);
      throw new Error('Error parsing server response');
    }
    
    console.log('Fetched data after client-side filtering:', {
      ambulance: Array.isArray(ambulanceData) ? ambulanceData.length : 'not an array',
      court: Array.isArray(courtData) ? courtData.length : 'not an array',
      docs: docData && docData.documentRequests ? docData.documentRequests.length : 0,
      reports: reportData && reportData.reports ? reportData.reports.length : 0,
      proposals: proposalData && proposalData.proposals ? proposalData.proposals.length : 0,
      residents: residentData && residentData.data ? residentData.data.length : 0,
      logs: logsData && logsData.logs ? logsData.logs.length : 0
    });
    
    // Process ambulance data with safe accesses
    const ambulanceStats = {
      total: Array.isArray(ambulanceData) ? ambulanceData.length : 0,
      pending: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'pending').length : 0,
      booked: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'booked').length : 0,
      completed: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'completed').length : 0,
      cancelled: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'cancelled').length : 0
    };
    
    // Process court data with safe accesses
    const courtStats = {
      total: Array.isArray(courtData) ? courtData.length : 0,
      pending: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'pending').length : 0,
      approved: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'approved').length : 0,
      rejected: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'rejected').length : 0,
      cancelled: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'cancelled').length : 0
    };
    
    // Add this after parsing court data
    console.log('Raw Court Data:', courtData);
    if (Array.isArray(courtData)) {
      console.log('Total court reservations:', courtData.length);
      console.log('Status breakdown:', {
        pending: courtData.filter(item => item && item.status === 'pending').length,
        approved: courtData.filter(item => item && item.status === 'approved').length,
        rejected: courtData.filter(item => item && item.status === 'rejected').length,
        cancelled: courtData.filter(item => item && item.status === 'cancelled').length,
        noStatus: courtData.filter(item => !item || !item.status).length,
        otherStatus: courtData.filter(item => item && item.status && !['pending', 'approved', 'rejected', 'cancelled'].includes(item.status)).length
      });
      
      // Check if there are any reservations with unexpected status values
      const unexpectedStatus = courtData.filter(item => item && item.status && !['pending', 'approved', 'rejected', 'cancelled'].includes(item.status));
      if (unexpectedStatus.length > 0) {
        console.log('Reservations with unexpected status:', unexpectedStatus);
      }
    }

    // Process document data with safe accesses
    const docRequests = docData && Array.isArray(docData.documentRequests) ? docData.documentRequests : [];
    const docStats = {
      total: docRequests.length,
      pending: docRequests.filter(item => item && item.status === 'pending').length,
      inProgress: docRequests.filter(item => item && item.status === 'in_progress').length,
      completed: docRequests.filter(item => item && item.status === 'completed').length,
      rejected: docRequests.filter(item => item && item.status === 'rejected').length
    };

    const activeDocRequests = docRequests.filter(request => request.status !== 'cancelled');
    setTotalDocRequests(activeDocRequests.length);

    // Calculate document type distribution
    const docTypeCounts = {};

    docRequests.forEach(request => {
      // Skip cancelled requests
      if (request && request.documentType && request.status !== 'cancelled') {
        // Format the document type name for better display
        const formattedType = request.documentType
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Increment count for this document type
        docTypeCounts[formattedType] = (docTypeCounts[formattedType] || 0) + 1;
      }
    });

    // Convert to array format for chart
    const docTypeData = Object.entries(docTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count (descending)

    // Add "Other Types" category if there are more than 5 types
    if (docTypeData.length > 5) {
      const topTypes = docTypeData.slice(0, 4);
      const otherTypes = docTypeData.slice(4);
      const otherCount = otherTypes.reduce((sum, type) => sum + type.value, 0);
      
      setDocumentTypeDistribution([
        ...topTypes,
        { name: 'Other Types', value: otherCount }
      ]);
    } else {
      // Use all document types if 5 or fewer
      setDocumentTypeDistribution(docTypeData);
    }

    // Process report data with safe accesses
    const reports = reportData && Array.isArray(reportData.reports) ? reportData.reports : [];
    const reportStats = {
      total: reports.length,
      pending: reports.filter(item => item && item.status === 'Pending').length,
      inProgress: reports.filter(item => item && item.status === 'In Progress').length,
      resolved: reports.filter(item => item && item.status === 'Resolved').length,
      cancelled: reports.filter(item => item && item.status === 'Cancelled').length
    };
    
    // Calculate average resolution time for resolved reports
    let averageResolutionTime = 0;
    let resolvedReportsWithDates = 0;

    if (reports && Array.isArray(reports)) {
      // Filter only resolved reports that have both created and updated dates
      const resolvedReports = reports.filter(
        report => report && report.status === 'Resolved' && report.createdAt && report.updatedAt
      );
      
      if (resolvedReports.length > 0) {
        // Calculate total resolution time in milliseconds
        const totalResolutionTime = resolvedReports.reduce((total, report) => {
          const createdDate = new Date(report.createdAt);
          const updatedDate = new Date(report.updatedAt);
          return total + (updatedDate - createdDate);
        }, 0);
        
        // Calculate average resolution time in days
        averageResolutionTime = totalResolutionTime / resolvedReports.length / (1000 * 60 * 60 * 24);
        resolvedReportsWithDates = resolvedReports.length;
      }
    }

    // Calculate issue type distribution
    const issueTypeCounts = {};

    if (reports && Array.isArray(reports)) {
      reports.forEach(report => {
        if (report && report.issueType) {
          // Increment count for this issue type
          issueTypeCounts[report.issueType] = (issueTypeCounts[report.issueType] || 0) + 1;
        }
      });
    }

    // Convert to array format for chart
    const issueTypeData = Object.entries(issueTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count (descending)

    // Add "Other Issues" category if there are more than 5 types
    if (issueTypeData.length > 5) {
      const topIssues = issueTypeData.slice(0, 4);
      const otherIssues = issueTypeData.slice(4);
      const otherCount = otherIssues.reduce((sum, issue) => sum + issue.value, 0);
      
      const chartData = [
        ...topIssues,
        { name: 'Other Issues', value: otherCount }
      ];
      
      // Store the processed issue type data
      setReportIssueTypes(chartData);
    } else {
      // Use all issue types if 5 or fewer
      setReportIssueTypes(issueTypeData);
    }

    // Store the average resolution time
    setReportStats(prevStats => ({
      ...prevStats,
      averageResolutionTime: averageResolutionTime.toFixed(1),
      resolvedCount: resolvedReportsWithDates
    }));

    // Process proposal data with safe accesses - FIXED
    const proposals = proposalData && Array.isArray(proposalData.proposals) ? proposalData.proposals : [];
    console.log('Processing proposals array:', proposals);
    
    // Log each proposal for debugging
    if (proposals.length > 0) {
      console.log('First proposal example:', proposals[0]);
    } else {
      console.log('No proposals found in the data');
    }
    
    const proposalStats = {
      total: proposals.length,
      pending: proposals.filter(item => item && item.status === 'pending').length,
      inReview: proposals.filter(item => item && item.status === 'in_review').length,
      considered: proposals.filter(item => item && item.status === 'considered').length,
      approved: proposals.filter(item => item && item.status === 'approved').length,
      rejected: proposals.filter(item => item && item.status === 'rejected').length
    };
    
    console.log('Proposal stats calculated:', proposalStats);
    
    // Calculate today's requests
    const today = new Date().toISOString().split('T')[0];
    
    // Safe array operations
    const todayAmbulance = Array.isArray(ambulanceData) ? 
      ambulanceData.filter(item => item && item.createdAt && item.createdAt.startsWith(today)).length : 0;
    
    const todayCourt = Array.isArray(courtData) ? 
      courtData.filter(item => item && item.createdAt && item.createdAt.startsWith(today)).length : 0;
    
    const todayDocs = docRequests.filter(item => 
      item && item.createdAt && item.createdAt.startsWith(today)
    ).length;
    
    const todayReports = reports.filter(item => 
      item && item.createdAt && item.createdAt.startsWith(today)
    ).length;
    
    // Fix for today's proposals - ensure we're checking the date correctly
    const todayProposals = proposals.filter(item => {
      if (!item || !item.createdAt) return false;
      // Try to handle different date formats
      const itemDate = typeof item.createdAt === 'string' ? item.createdAt : 
                      (item.createdAt instanceof Date ? item.createdAt.toISOString() : null);
      return itemDate ? itemDate.startsWith(today) : false;
    }).length;
    
    console.log('Today\'s requests:', {
      ambulance: todayAmbulance,
      court: todayCourt,
      docs: todayDocs,
      reports: todayReports,
      proposals: todayProposals,
      total: todayAmbulance + todayCourt + todayDocs + todayReports + todayProposals
    });
    
    const todayRequests = todayAmbulance + todayCourt + todayDocs + todayReports + todayProposals;
    
    // Process resident data - IMPORTANT: This needs to be defined before using it
    const residents = residentData && residentData.data ? residentData.data : [];
    
    // Handle resident counts safely
    // Count verified residents - those with isVerified = true
    const verifiedCount = residents.filter(resident => resident && resident.isVerified === true).length;
    // For voter count, ONLY count voters who are ALSO verified
    // This ensures unverified voters don't count toward the voter count
    const voterCount = residents.filter(resident => 
      resident && resident.isVerified === true && resident.isVoter === true
    ).length;
    // For pending count, only count residents with isVerified = false (unverified)
    const pendingCount = residents.filter(resident => 
      resident && resident.isVerified === false
    ).length;
    
    // Log detailed counts for debugging
    console.log("Resident counts:", {
      total: residents.length,
      verified: verifiedCount,
      verifiedVoters: voterCount,
      pending: pendingCount
    });
    
    // Update the stats state with the correct counts
    setStats({
      todayRequests,
      residentCount: residents.length,
      verifiedCount,
      voterCount,
      pendingCount
    });
    
    // Update service data state - FIXED to include proposals correctly
    setServiceData({
      ambulance: ambulanceStats,
      court: courtStats,
      documents: docStats,
      reports: reportStats,
      proposals: proposalStats
    });
    
    // Generate time series data for trend analysis
    const dateMap = new Map();
    
    // Initialize dates for the past X days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        ambulance: 0,
        court: 0,
        documents: 0,
        reports: 0,
        proposals: 0,
        total: 0
      });
    }
    
    // Count requests by date for each service with safe accesses
    if (Array.isArray(ambulanceData)) {
      ambulanceData.forEach(booking => {
        if (booking && booking.createdAt) {
          const dateStr = new Date(booking.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr);
            dayData.ambulance += 1;
            dayData.total += 1;
            dateMap.set(dateStr, dayData);
          }
        }
      });
    }
    
    if (Array.isArray(courtData)) {
      courtData.forEach(reservation => {
        if (reservation && reservation.createdAt) {
          const dateStr = new Date(reservation.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr);
            dayData.court += 1;
            dayData.total += 1;
            dateMap.set(dateStr, dayData);
          }
        }
      });
    }
    
    docRequests.forEach(doc => {
      // Skip cancelled requests
      if (doc && doc.createdAt && doc.status !== 'cancelled') {
        const dateStr = new Date(doc.createdAt).toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
          const dayData = dateMap.get(dateStr);
          dayData.documents += 1;
          dayData.total += 1;
          dateMap.set(dateStr, dayData);
        }
      }
    });
    
    reports.forEach(report => {
      if (report && report.createdAt) {
        const dateStr = new Date(report.createdAt).toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
          const dayData = dateMap.get(dateStr);
          dayData.reports += 1;
          dayData.total += 1;
          dateMap.set(dateStr, dayData);
        }
      }
    });
    
    // FIXED: proper handling of proposal dates
    proposals.forEach(proposal => {
      if (proposal && proposal.createdAt) {
        try {
          // Convert to date object to handle different date formats
          const dateObj = new Date(proposal.createdAt);
          if (!isNaN(dateObj.getTime())) {
            const dateStr = dateObj.toISOString().split('T')[0];
            if (dateMap.has(dateStr)) {
              const dayData = dateMap.get(dateStr);
              dayData.proposals += 1;
              dayData.total += 1;
              dateMap.set(dateStr, dayData);
            }
          }
        } catch (dateError) {
          console.error('Error processing proposal date:', dateError, proposal);
        }
      }
    });
    
    // Log the date map to verify proposal data is being counted
    console.log('Date map entries (sample):', Array.from(dateMap.entries()).slice(0, 5));
    
    // Convert Map to array and sort by date
    const timeSeriesArray = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('Time series data sample:', timeSeriesArray.slice(0, 5));
    
    setTimeSeriesData(timeSeriesArray);
    
    // Create service distribution data for pie chart - FIXED to include proposals
    setServiceDistribution([
      { name: 'Ambulance', value: ambulanceStats.total },
      { name: 'Court', value: courtStats.total },
      { name: 'Documents', value: docStats.total },
      { name: 'Reports', value: reportStats.total },
      { name: 'Proposals', value: proposalStats.total }
    ]);
    
    // Create request trends data
    const weekData = timeSeriesArray.slice(-7);
    const monthData = timeSeriesArray;
    
    const weeklyAvg = weekData.reduce((acc, curr) => acc + curr.total, 0) / Math.max(weekData.length, 1);
    const monthlyAvg = monthData.reduce((acc, curr) => acc + curr.total, 0) / Math.max(monthData.length, 1);
    
    setRequestTrends([
      { name: 'Today', value: todayRequests },
      { name: 'Weekly Avg', value: weeklyAvg.toFixed(1) },
      { name: 'Monthly Avg', value: monthlyAvg.toFixed(1) }
    ]);
    
    // Count residents by type - ensure all types are counted separately
    const typeCounter = {
      'Minor': 0,
      '18-30': 0,
      'Illiterate': 0, 
      'PWD': 0,
      'Senior Citizen': 0,
      'Indigent': 0
    };
    
    // Count each type individually with safe access
    residents
      .filter(resident => resident && resident.isVerified === true) // Filter for verified residents only
      .forEach(resident => {
        if (resident && resident.types && Array.isArray(resident.types)) {
          resident.types.forEach(type => {
            // Increment counter for this specific type
            if (typeCounter.hasOwnProperty(type)) {
              typeCounter[type] += 1;
            }
          });
        }
      });
    
    // Log the type counter for debugging
    console.log("Verified residents type counter:", typeCounter);
    
    // Create type data for charts - filter out zero values
    const residentTypeData = Object.entries(typeCounter)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
    
    setResidentTypes(residentTypeData);
    
    // Create resident registration trends data
    // Group residents by registration month
    const registrationDateMap = new Map();

    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      registrationDateMap.set(monthYear, {
        month: monthYear,
        residents: 0
      });
    }

    // Count registrations by month with safe access
    residents
      .filter(resident => resident && resident.isVerified === true) // Filter for verified residents only
      .forEach(resident => {
        if (resident && resident.createdAt) {
          const date = new Date(resident.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (registrationDateMap.has(monthYear)) {
            const monthData = registrationDateMap.get(monthYear);
            monthData.residents += 1;
            registrationDateMap.set(monthYear, monthData);
          }
        }
      });

    // Convert Map to array and sort by date
    const registrationTrendsArray = Array.from(registrationDateMap.values())
      .sort((a, b) => {
        try {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const aDate = new Date(`${aMonth} 1, ${aYear}`);
          const bDate = new Date(`${bMonth} 1, ${bYear}`);
          return aDate - bDate;
        } catch (e) {
          console.error('Error sorting registration trends:', e);
          return 0;
        }
      });

    setResidentRegistrationTrends(registrationTrendsArray);
    
    // Process logs for recent activity with safe accesses
    if (logsData && Array.isArray(logsData.logs) && logsData.logs.length > 0) {
      // Use actual logs from backend
      const formattedLogs = logsData.logs.map(log => ({
        id: log._id || `log-${Math.random()}`,
        type: log.entityType || (log.action ? log.action.split('_')[0] : 'Activity'),
        action: log.action || 'ACTIVITY',
        details: log.details || 'System activity',
        admin: log.adminName || 'System',
        timestamp: new Date(log.timestamp || log.createdAt || Date.now())
      })).slice(0, 10); // Get 10 most recent
      
      setRecentActivity(formattedLogs);
    } else if (Array.isArray(ambulanceData) && ambulanceData.length > 0 || 
                Array.isArray(courtData) && courtData.length > 0) {
      // If no logs, create activity from recent requests
      const activities = [];
      
      // Add recent ambulance bookings
      if (Array.isArray(ambulanceData)) {
        ambulanceData.slice(0, 3).forEach(booking => {
          if (booking && booking.createdAt) {
            activities.push({
              id: booking._id || `amb-${Math.random()}`,
              type: 'Ambulance',
              action: 'BOOKING_CREATED',
              details: `Ambulance booking for ${booking.patientName || 'Unknown'}`,
              admin: booking.processedBy ? 
                `${booking.processedBy.firstName || ''} ${booking.processedBy.lastName || ''}` : 
                'System',
              timestamp: new Date(booking.createdAt)
            });
          }
        });
      }
      
      // Add recent court reservations
      if (Array.isArray(courtData)) {
        courtData.slice(0, 3).forEach(reservation => {
          if (reservation && reservation.createdAt) {
            activities.push({
              id: reservation._id || `court-${Math.random()}`,
              type: 'Court',
              action: 'RESERVATION_CREATED',
              details: `Court reservation by ${reservation.representativeName || 'Unknown'}`,
              admin: reservation.processedBy ? 
                `${reservation.processedBy.firstName || ''} ${reservation.processedBy.firstName || ''} ${reservation.processedBy.lastName || ''}` : 
                'System',
              timestamp: new Date(reservation.createdAt)
            });
          }
        });
      }
      
      // ADDED: Include recent proposal activities
      if (Array.isArray(proposals) && proposals.length > 0) {
        proposals.slice(0, 3).forEach(proposal => {
          if (proposal && proposal.createdAt) {
            activities.push({
              id: proposal._id || `proposal-${Math.random()}`,
              type: 'Proposal',
              action: 'PROPOSAL_SUBMITTED',
              details: `Project proposal "${proposal.projectTitle || 'Unknown'}" submitted`,
              admin: proposal.processedBy ? 
                `${proposal.processedBy.firstName || ''} ${proposal.processedBy.lastName || ''}` : 
                'System',
              timestamp: new Date(proposal.createdAt)
            });
          }
        });
      }
      
      // Sort by timestamp and take top 10
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities.slice(0, 10));
    } else {
      // Fallback with sample data if no real data is available
      setRecentActivity([
        { id: '1', type: 'Ambulance', action: 'BOOKING_CREATED', details: 'New ambulance booking', admin: 'Admin', timestamp: new Date() },
        { id: '2', type: 'Document', action: 'REQUEST_APPROVED', details: 'Document request approved', admin: 'Admin', timestamp: new Date(Date.now() - 3600000) },
        { id: '3', type: 'Court', action: 'RESERVATION_CANCELLED', details: 'Court reservation cancelled', admin: 'Admin', timestamp: new Date(Date.now() - 7200000) }
      ]);
    }
    
    setLoading(false);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    setError('Failed to load dashboard data. Please try again later.');
    setLoading(false);
  }
};
  
  // Initial data fetch
  useEffect(() => {
    fetchData(timeRange);
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchData(timeRange);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    pending: '#FFBB28',
    booked: '#00C49F',
    completed: '#0088FE',
    cancelled: '#FF8042',
    rejected: '#d32f2f',
    inProgress: '#8884d8',
    inReview: '#82ca9d',
    considered: '#ffc658',
    approved: '#0088FE',
    resolved: '#0088FE'
  };
  
  return (
    <Box sx={{ 
      flexGrow: 1, 
      width: '100%',
      p: 0 
    }}>
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
        component="h1" 
        sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <DashboardIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        Brgy Maahas Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 140, mr: 2 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range-select"
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
          </Select>
        </FormControl>
          
          <IconButton 
          onClick={handleMenuClick}
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          elevation={2}
          PaperProps={{
            sx: { 
              borderRadius: 2,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
              mt: 1
            }
          }}
        >
          <MenuItem onClick={() => {
            fetchData(timeRange);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Refresh Data</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <FileDownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Report</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
      
      {/* Overview Cards */}
    <Grid container spacing={3} sx={{ mb: 3 }}>  
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            minHeight: 120, 
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <PeopleAlt />
              </Avatar>
              <Box>
                <Typography 
                  color="textSecondary" 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    fontSize: '0.7rem' 
                  }}
                >
                  Registered Residents
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary.main" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  {stats.verifiedCount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.75rem'
              }}
            >
              <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
              Total in database
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            minHeight: 120, 
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: 'success.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <AssignmentTurnedInIcon />
              </Avatar>
              <Box>
                <Typography 
                  color="textSecondary" 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    fontSize: '0.7rem' 
                  }}
                >
                  Service Requests
                </Typography>
                <Typography 
                  variant="h4" 
                  color="success.main" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  {(serviceData.ambulance.total + serviceData.court.total + 
                    serviceData.documents.total + serviceData.reports.total + 
                    serviceData.proposals.total).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.75rem'
              }}
            >
              <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
              Total service requests
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            minHeight: 120, 
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  color: 'warning.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <EventIcon />
              </Avatar>
              <Box>
                <Typography 
                  color="textSecondary" 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    fontSize: '0.7rem' 
                  }}
                >
                  Today's Requests
                </Typography>
                <Typography 
                  variant="h4" 
                  color="warning.main" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  {stats.todayRequests}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.75rem'
              }}
            >
              <TodayIcon sx={{ color: 'warning.main', mr: 0.5, fontSize: '1rem' }} />
              New today
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            minHeight: 120, 
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: 'info.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <HowToVoteIcon />
              </Avatar>
              <Box>
                <Typography 
                  color="textSecondary" 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    fontSize: '0.7rem' 
                  }}
                >
                  Registered Voters
                </Typography>
                <Typography 
                  variant="h4" 
                  color="info.main" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}
                >
                  {stats.voterCount}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.75rem'
              }}
            >
              <PercentIcon sx={{ color: 'info.main', mr: 0.5, fontSize: '1rem' }} />
              {stats.verifiedCount > 0 ? ((stats.voterCount / stats.verifiedCount) * 100).toFixed(1) : 0}% of residents
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
      
      {/* Tabs for different analytics views */}
      <Paper 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            background: alpha(theme.palette.primary.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 56,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              px: 3
            }
          }}
        >
          <Tab icon={<FormatListBulleted sx={{ mb: 0.5 }} />} label="Overview" iconPosition="start" />
          <Tab icon={<LocalHospital sx={{ mb: 0.5 }} />} label="Ambulance" iconPosition="start" />
          <Tab icon={<SportsTennis sx={{ mb: 0.5 }} />} label="Court" iconPosition="start" />
          <Tab icon={<Description sx={{ mb: 0.5 }} />} label="Documents" iconPosition="start" />
          <Tab icon={<Assignment sx={{ mb: 0.5 }} />} label="Reports" iconPosition="start" />
          <Tab icon={<Announcement sx={{ mb: 0.5 }} />} label="Proposals" iconPosition="start" />
          <Tab icon={<PeopleAlt sx={{ mb: 0.5 }} />} label="Residents" iconPosition="start" />
        </Tabs>
        
        {/* Tab content areas */}
        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {tabValue === 0 && (
      <Grid container spacing={3}>
        {/* Service Request Trends */}
        <Grid item xs={12} md={8} sx={{ minWidth: { md: '250px' } }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Service Request Trends
            </Typography>
          </Box>
          <Paper 
            sx={{ 
              p: 2, 
              height: 450, 
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  stroke={alpha('#000', 0.3)}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  stroke={alpha('#000', 0.3)}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'total' ? 'Total' : name.charAt(0).toUpperCase() + name.slice(1)]}
                  labelFormatter={(date) => formatDate(date)}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                    fontSize: '0.75rem'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8884d8" 
                  name="Total" 
                  strokeWidth={2.5}
                  dot={{ r: 1 }}
                  activeDot={{ r: 5 }}
                />
                <Line type="monotone" dataKey="ambulance" stroke="#0088FE" name="Ambulance" dot={false} />
                <Line type="monotone" dataKey="court" stroke="#00C49F" name="Court" dot={false} />
                <Line type="monotone" dataKey="documents" stroke="#FFBB28" name="Documents" dot={false} />
                <Line type="monotone" dataKey="reports" stroke="#FF8042" name="Reports" dot={false} />
                <Line type="monotone" dataKey="proposals" stroke="#82ca9d" name="Proposals" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Service Distribution */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', minWidth: { md: '470px' } }}>
            <PieChartIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Service Distribution
            </Typography>
          </Box>
          <Paper 
            sx={{ 
              p: 2, 
              height: 450, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                    fontSize: '0.75rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mt: 2, 
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontStyle: 'italic'
              }}
            >
              Distribution of service requests across different categories
            </Typography>
          </Paper>
        </Grid>
              
              {/* Request Status Overview */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Request Status Overview
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Ambulance',
                          pending: serviceData.ambulance.pending,
                          inProgress: serviceData.ambulance.booked,
                          completed: serviceData.ambulance.completed,
                          cancelled: serviceData.ambulance.cancelled
                        },
                        {
                          name: 'Court',
                          pending: serviceData.court.pending,
                          approved: serviceData.court.approved,
                          rejected: serviceData.court.rejected,
                          cancelled: serviceData.court.cancelled
                        },
                        {
                          name: 'Documents',
                          pending: serviceData.documents.pending,
                          inProgress: serviceData.documents.inProgress,
                          completed: serviceData.documents.completed,
                          rejected: serviceData.documents.rejected
                        },
                        {
                          name: 'Reports',
                          pending: serviceData.reports.pending,
                          inProgress: serviceData.reports.inProgress,
                          resolved: serviceData.reports.resolved,
                          cancelled: serviceData.reports.cancelled
                        },
                        {
                          name: 'Proposals',
                          pending: serviceData.proposals.pending,
                          inReview: serviceData.proposals.inReview,
                          considered: serviceData.proposals.considered,
                          approved: serviceData.proposals.approved,
                          rejected: serviceData.proposals.rejected
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
                      <Bar dataKey="inProgress" stackId="a" fill={STATUS_COLORS.inProgress} name="In Progress" />
                      <Bar dataKey="inReview" stackId="a" fill={STATUS_COLORS.inReview} name="In Review" />
                      <Bar dataKey="considered" stackId="a" fill={STATUS_COLORS.considered} name="Considered" />
                      <Bar dataKey="approved" stackId="a" fill={STATUS_COLORS.approved} name="Approved" />
                      <Bar dataKey="completed" stackId="a" fill={STATUS_COLORS.completed} name="Completed" />
                      <Bar dataKey="resolved" stackId="a" fill={STATUS_COLORS.resolved} name="Resolved" />
                      <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} name="Rejected" />
                      <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} name="Cancelled" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Ambulance Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '550px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Ambulance Booking Status
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    width: '94%', 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.ambulance.pending },
                          { name: 'Booked', value: serviceData.ambulance.booked },
                          { name: 'Completed', value: serviceData.ambulance.completed },
                          { name: 'Cancelled', value: serviceData.ambulance.cancelled }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.booked} />
                        <Cell fill={STATUS_COLORS.completed} />
                        <Cell fill={STATUS_COLORS.cancelled} />
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Ambulance Booking Trends
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    width: '94%', 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Bookings']}
                        labelFormatter={(date) => formatDate(date)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line 
                        type="monotone" 
                        dataKey="ambulance" 
                        stroke="#0088FE" 
                        name="Ambulance Bookings" 
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Ambulance Usage Statistics
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <SummarizeIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Total Bookings
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              color: 'text.primary',
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.ambulance.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.warning.main, 0.1), 
                                color: 'warning.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PendingIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Pending
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="warning.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.ambulance.pending}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.1), 
                                color: 'success.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <CalendarMonthIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Booked
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="success.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.ambulance.booked}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.info.main, 0.1), 
                                color: 'info.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Completion Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="info.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.ambulance.total > 0 
                              ? `${((serviceData.ambulance.completed / serviceData.ambulance.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Court Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '470px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Court Reservation Status
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.court.pending },
                          { name: 'Approved', value: serviceData.court.approved },
                          { name: 'Rejected', value: serviceData.court.rejected },
                          { name: 'Cancelled', value: serviceData.court.cancelled }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.approved} />
                        <Cell fill={STATUS_COLORS.rejected} />
                        <Cell fill={STATUS_COLORS.cancelled} />
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '470px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Court Reservation Trends
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Reservations']}
                        labelFormatter={(date) => formatDate(date)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line 
                        type="monotone" 
                        dataKey="court" 
                        stroke="#00C49F" 
                        name="Court Reservations" 
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Court Usage Statistics
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <SummarizeIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Total Reservations
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              color: 'text.primary',
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.court.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.1), 
                                color: 'success.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Approval Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="success.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.approved / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1), 
                                color: 'error.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Rejection Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="error.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.rejected / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.warning.main, 0.1), 
                                color: 'warning.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Cancellation Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="warning.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.cancelled / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Documents Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Document Request Status
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.documents.pending },
                          { name: 'In Progress', value: serviceData.documents.inProgress },
                          { name: 'Completed', value: serviceData.documents.completed },
                          { name: 'Rejected', value: serviceData.documents.rejected }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.inProgress} />
                        <Cell fill={STATUS_COLORS.completed} />
                        <Cell fill={STATUS_COLORS.rejected} />
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Document Request Trends
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    width: "93%", 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Requests']}
                        labelFormatter={(date) => formatDate(date)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line 
                        type="monotone" 
                        dataKey="documents" 
                        stroke="#FFBB28" 
                        name="Document Requests" 
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Popular Document Types
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2,
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}
                  >
                    This chart shows distribution of document types requested by residents
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                      data={documentTypeDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        angle={-45}
                        textAnchor="end"
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Bar dataKey="value" fill="#FFBB28" name="Document Requests">
                        {documentTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {documentTypeDistribution.length === 0 && (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 5 }}>
                      No document request data available yet
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ 
                      display: 'block',
                      textAlign: 'right',
                      mt: 1,
                      fontStyle: 'italic',
                      fontSize: '0.7rem'
                    }}
                  >
                    Based on {totalDocRequests} document requests
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          
        {/* Reports Tab with Real Data */}
        {tabValue === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} sx={{ minWidth: { md: '450px' } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Infrastructure Report Status
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 450, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: serviceData.reports.pending },
                        { name: 'In Progress', value: serviceData.reports.inProgress },
                        { name: 'Resolved', value: serviceData.reports.resolved },
                        { name: 'Cancelled', value: serviceData.reports.cancelled }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={STATUS_COLORS.pending} />
                      <Cell fill={STATUS_COLORS.inProgress} />
                      <Cell fill={STATUS_COLORS.resolved} />
                      <Cell fill={STATUS_COLORS.cancelled} />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ minWidth: { md: '450px' } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Issue Types
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 450, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: '0.8rem',
                    fontStyle: 'italic'
                  }}
                >
                  Distribution of reported infrastructure issues
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={reportIssueTypes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      angle={-45}
                      textAnchor="end"
                      stroke={alpha('#000', 0.3)}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      stroke={alpha('#000', 0.3)}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Bar dataKey="value" fill="#FF8042" name="Reports">
                      {reportIssueTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {reportIssueTypes.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 5 }}>
                    No report data available yet
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Report Resolution Time
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 300, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              color: 'primary.main',
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Average Resolution Time
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h4" 
                          color="primary.main" 
                          sx={{ 
                            fontWeight: 600, 
                            mt: 1,
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          {reportStats.averageResolutionTime} days
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{
                            mt: 1,
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}
                        >
                          Based on {reportStats.resolvedCount} resolved reports
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: 'success.main',
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            <PercentIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Resolution Rate
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h4" 
                          color="success.main" 
                          sx={{ 
                            fontWeight: 600, 
                            mt: 1,
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          {serviceData.reports.total > 0 
                            ? `${((serviceData.reports.resolved / serviceData.reports.total) * 100).toFixed(1)}%` 
                            : '0%'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{
                            mt: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Successfully resolved reports
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.warning.main, 0.1), 
                              color: 'warning.main',
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            <PendingIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Pending Reports
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h4" 
                          color="warning.main" 
                          sx={{ 
                            fontWeight: 600, 
                            mt: 1,
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          {serviceData.reports.pending}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{
                            mt: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Requiring attention
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Proposals Tab */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Project Proposal Status
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.proposals.pending },
                          { name: 'In Review', value: serviceData.proposals.inReview },
                          { name: 'Considered', value: serviceData.proposals.considered },
                          { name: 'Approved', value: serviceData.proposals.approved },
                          { name: 'Rejected', value: serviceData.proposals.rejected }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.inReview} />
                        <Cell fill={STATUS_COLORS.considered} />
                        <Cell fill={STATUS_COLORS.approved} />
                        <Cell fill={STATUS_COLORS.rejected} />
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Proposal Trends
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 450, 
                    width:"94%", 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        stroke={alpha('#000', 0.3)}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Proposals']}
                        labelFormatter={(date) => formatDate(date)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line 
                        type="monotone" 
                        dataKey="proposals" 
                        stroke="#82ca9d" 
                        name="Project Proposals" 
                        strokeWidth={2}
                        dot={{ r: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Proposal Metrics
                  </Typography>
                </Box>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <SummarizeIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Total Proposals
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              color: 'text.primary',
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.proposals.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.1), 
                                color: 'success.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Approval Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="success.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.proposals.total > 0 
                              ? `${((serviceData.proposals.approved / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.info.main, 0.1), 
                                color: 'info.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Consideration Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="info.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.proposals.total > 0 
                              ? `${(((serviceData.proposals.considered + serviceData.proposals.inReview) / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1), 
                                color: 'error.main',
                                width: 36,
                                height: 36,
                                mr: 1.5
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Typography 
                              variant="subtitle2" 
                              color="textSecondary" 
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              Rejection Rate
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h4" 
                            color="error.main" 
                            sx={{ 
                              fontWeight: 600, 
                              mt: 1,
                              fontSize: { xs: '1.5rem', sm: '1.75rem' }
                            }}
                          >
                            {serviceData.proposals.total > 0 
                              ? `${((serviceData.proposals.rejected / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
        {/* Residents Tab - Now with real data */}
        {tabValue === 6 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Resident Registration Trends
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 450, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={residentRegistrationTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      angle={-45}
                      textAnchor="end"
                      stroke={alpha('#000', 0.3)}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      stroke={alpha('#000', 0.3)}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'New Registrations']}
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line 
                      type="monotone" 
                      dataKey="residents" 
                      stroke="#8884d8" 
                      name="New Registrations" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ minWidth: { md: '500px' } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DonutLargeIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Resident Type Distribution
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 450, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={residentTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {residentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '15px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Resident Database Metrics
                </Typography>
              </Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              color: 'primary.main',
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            <PeopleAltIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Total Residents
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 600, 
                            mt: 1,
                            color: 'text.primary',
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          {stats.residentCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: 'success.main',
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            <VerifiedUserIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Verified Residents
                          </Typography>
                        </Box>
                            <Typography 
                              variant="h4" 
                              color="success.main" 
                              sx={{ 
                                fontWeight: 600, 
                                mt: 1,
                                fontSize: { xs: '1.5rem', sm: '1.75rem' }
                              }}
                            >
                              {stats.verifiedCount}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{
                                mt: 1,
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <PercentIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                              {stats.residentCount > 0 ? ((stats.verifiedCount / stats.residentCount) * 100).toFixed(1) : 0}% of total
                            </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Card 
                                      sx={{ 
                                        borderRadius: 2,
                                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                          transform: 'translateY(-4px)',
                                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                                        }
                                      }}
                                    >
                                      <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                          <Avatar 
                                            sx={{ 
                                              bgcolor: alpha(theme.palette.info.main, 0.1), 
                                              color: 'info.main',
                                              width: 36,
                                              height: 36,
                                              mr: 1.5
                                            }}
                                          >
                                            <HowToVoteIcon sx={{ fontSize: '1.2rem' }} />
                                          </Avatar>
                                          <Typography 
                                            variant="subtitle2" 
                                            color="textSecondary" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              fontSize: '0.7rem',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.05em'
                                            }}
                                          >
                                            Registered Voters
                                          </Typography>
                                        </Box>
                                        <Typography 
                                          variant="h4" 
                                          color="info.main" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            mt: 1,
                                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                                          }}
                                        >
                                          {stats.voterCount}
                                        </Typography>
                                        <Typography 
                                          variant="body2" 
                                          color="textSecondary"
                                          sx={{
                                            mt: 1,
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                          }}
                                        >
                                          <PercentIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                                          {stats.verifiedCount > 0 ? ((stats.voterCount / stats.verifiedCount) * 100).toFixed(1) : 0}% of verified
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Card 
                                      sx={{ 
                                        borderRadius: 2,
                                        boxShadow: '0 2px 14px 0 rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                          transform: 'translateY(-4px)',
                                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
                                        }
                                      }}
                                    >
                                      <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                          <Avatar 
                                            sx={{ 
                                              bgcolor: alpha(theme.palette.warning.main, 0.1), 
                                              color: 'warning.main',
                                              width: 36,
                                              height: 36,
                                              mr: 1.5
                                            }}
                                          >
                                            <PendingActionsIcon sx={{ fontSize: '1.2rem' }} />
                                          </Avatar>
                                          <Typography 
                                            variant="subtitle2" 
                                            color="textSecondary" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              fontSize: '0.7rem',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.05em'
                                            }}
                                          >
                                            Pending Verification
                                          </Typography>
                                        </Box>
                                        <Typography 
                                          variant="h4" 
                                          color="warning.main" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            mt: 1,
                                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                                          }}
                                        >
                                          {stats.pendingCount}
                                        </Typography>
                                        <Typography 
                                          variant="body2" 
                                          color="textSecondary"
                                          sx={{
                                            mt: 1,
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                          }}
                                        >
                                          <PercentIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                                          {stats.residentCount > 0 ? ((stats.pendingCount / stats.residentCount) * 100).toFixed(1) : 0}% of total
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ 
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Box>
    // </ThemeProvider>
  );
};

export default AdminDashboard;