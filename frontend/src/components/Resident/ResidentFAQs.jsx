import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  InputBase,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import ConstructionIcon from '@mui/icons-material/Construction';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';

function ResidentFAQs() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // FAQ categories
  const categories = [
    { id: 'all', label: 'All FAQs', icon: <HelpIcon fontSize="small" /> },
    { id: 'documents', label: 'Document Requests', icon: <AssignmentIcon fontSize="small" /> },
    { id: 'ambulance', label: 'Ambulance Services', icon: <LocalHospitalIcon fontSize="small" /> },
    { id: 'court', label: 'Court Reservation', icon: <SportsBasketballIcon fontSize="small" /> },
    { id: 'infrastructure', label: 'Infrastructure Reports', icon: <ConstructionIcon fontSize="small" /> },
    { id: 'proposals', label: 'Project Proposals', icon: <LightbulbIcon fontSize="small" /> },
    { id: 'account', label: 'Account & Registration', icon: <PersonIcon fontSize="small" /> },
  ];

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: 'How do I register as a resident of Barangay Maahas?',
      answer: 'To register as a resident, you need to create an account on the B-Hub website and provide proof of residency such as a valid ID with your address, utility bills, or property documents. The barangay staff will verify your documents before approving your account.',
      category: 'account'
    },
    {
      id: 2,
      question: 'What documents can I request from the barangay?',
      answer: 'You can request various documents including Barangay Clearance, Certificate of Residency, Business Permit, Certificate of Indigency, Barangay ID, Digging Permit, Fencing Permit, No Objection Certificate, Request for Assistance, and Lot Ownership documentation. Each document may have different requirements which will be specified when you make the request.',
      category: 'documents'
    },
    {
      id: 3,
      question: 'How long does it take to process document requests?',
      answer: 'Document requests are typically processed within 1-3 business days, depending on the type of document and current volume of requests. Once processed, you will receive a notification and can pick up your document at the Barangay Hall.',
      category: 'documents'
    },
    {
      id: 4,
      question: 'Is there a fee for barangay services?',
      answer: 'Most barangay documents have minimal processing fees as mandated by local ordinances. The exact fee will be indicated when you submit your request. Some services like ambulance booking for emergencies are provided free of charge to residents.',
      category: 'documents'
    },
    {
      id: 5,
      question: 'Do I need to visit the barangay hall to request documents?',
      answer: 'No, registered residents can request documents online through the B-Hub platform. You only need to visit the barangay hall to pick up the physical document once it has been processed and approved.',
      category: 'documents'
    },
    {
      id: 6,
      question: 'How can I book the barangay ambulance?',
      answer: 'Registered residents can book the ambulance service through the B-Hub portal. For emergencies, you can make an immediate request, or you can schedule a non-emergency medical transport in advance. The service is prioritized based on medical urgency.',
      category: 'ambulance'
    },
    {
      id: 7,
      question: 'Is the ambulance service free?',
      answer: 'The ambulance service is generally provided free of charge to residents. However, for non-emergency scheduled transports, there might be a fee to cover fuel costs, especially during the latter part of the year due to budget constraints.',
      category: 'ambulance'
    },
    {
      id: 8,
      question: 'What is the coverage area of the barangay ambulance?',
      answer: 'The barangay ambulance primarily serves residents within Barangay Maahas. However, it can transport patients to hospitals in Los Baños and neighboring municipalities depending on the medical situation and availability.',
      category: 'ambulance'
    },
    {
      id: 9,
      question: 'How do I reserve the barangay basketball court?',
      answer: 'Residents can reserve the basketball court through the B-Hub platform by selecting available dates and times. Reservations can be made up to 2 weeks in advance, and are subject to approval based on existing schedules and community activities.',
      category: 'court'
    },
    {
      id: 10,
      question: 'What are the available time slots for court reservation?',
      answer: 'The basketball court is generally available from 6:00 AM to 10:00 PM daily. Reservation time slots are typically in 2-hour blocks, but may be adjusted for special events or community activities.',
      category: 'court'
    },
    {
      id: 11,
      question: 'Is there a fee for using the basketball court?',
      answer: 'Yes, there is a reservation fee for using the basketball court. The fee is ₱500 for a 2-hour slot. However, barangay-sponsored events and activities may be exempt from this fee.',
      category: 'court'
    },
    {
      id: 12,
      question: 'Can I report broken street lights or damaged roads?',
      answer: 'Yes, registered residents can submit infrastructure reports through the B-Hub platform. These reports are reviewed by the barangay and forwarded to the appropriate municipal department for action. You can track the status of your report through your account.',
      category: 'infrastructure'
    },
    {
      id: 13,
      question: 'What types of infrastructure issues can I report?',
      answer: 'You can report various issues including road damage (potholes, cracks), broken street lights, drainage problems (flooding, clogged drains), fallen trees, damaged public facilities, and other public infrastructure concerns within Barangay Maahas.',
      category: 'infrastructure'
    },
    {
      id: 14,
      question: 'How long does it take to address reported infrastructure issues?',
      answer: 'The timeframe for resolving infrastructure issues varies depending on the type and severity of the problem, as well as the responsible government unit. Simple issues may be addressed within a few days, while more complex problems may require coordination with municipal departments and take longer to resolve.',
      category: 'infrastructure'
    },
    {
      id: 15,
      question: 'What types of project proposals can I submit?',
      answer: 'Residents can submit proposals for community improvement projects, environmental initiatives, educational programs, health services, sports activities, and cultural events. Proposals should include objectives, target beneficiaries, and required resources.',
      category: 'proposals'
    },
    {
      id: 16,
      question: 'How are project proposals reviewed and approved?',
      answer: 'Project proposals are reviewed by the Barangay Council during their regular sessions. Criteria for approval include community benefit, feasibility, budget requirements, and alignment with barangay development plans. Proposers may be invited to present their ideas.',
      category: 'proposals'
    },
    {
      id: 17,
      question: 'Can I get funding for my community project proposal?',
      answer: 'Depending on the nature and scope of the project, approved proposals may receive support from the barangay budget or be recommended for municipal funding. The level of support varies based on available resources and the project\'s alignment with barangay priorities.',
      category: 'proposals'
    },
    {
      id: 18,
      question: 'What information do I need to provide when registering?',
      answer: 'When registering, you need to provide your full name, address within Barangay Maahas, contact information, valid ID, and proof of residency. Optional information includes household members, emergency contacts, and special needs for emergency situations.',
      category: 'account'
    },
    {
      id: 19,
      question: 'How do I update my personal information?',
      answer: 'You can update your personal information by logging into your B-Hub account and accessing the profile settings. For certain changes like address updates, you may need to provide updated documentation for verification purposes.',
      category: 'account'
    },
    {
      id: 20,
      question: 'Can non-residents access barangay services?',
      answer: 'While most services are prioritized for residents, non-residents may access certain services with limitations. For example, document requests might require additional verification, and facility reservations may have different rates or availability constraints.',
      category: 'account'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter FAQs based on search term and active category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Simple Header */}
      <Box sx={{ mb: 3}}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <HelpIcon sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 3,
            maxWidth: '90%',
          }}
        >
          Find answers to common questions about Barangay Maahas services. If you can't find what you're looking for, please contact the barangay office.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        component="form"
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          // maxWidth: 600,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search FAQs"
          inputProps={{ 'aria-label': 'search faqs' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <IconButton 
            sx={{ p: '10px' }} 
            aria-label="clear"
            onClick={() => setSearchTerm('')}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Paper>

      {/* Categories and FAQs */}
      <Grid container spacing={3}>
        {/* Category chips - always visible */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              component="h2" 
              sx={{ 
                fontWeight: 600, 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary'
              }}
            >
              <CategoryIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
              Filter by Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  onClick={() => setActiveCategory(category.id)}
                  color={activeCategory === category.id ? 'primary' : 'default'}
                  variant={activeCategory === category.id ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* FAQs Content */}
        <Grid item xs={12} sx={{minWidth: '100%'}}>
          <Box sx={{ mb: 2 }}>
            {/* Display active category title */}
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                pb: 1,
                mb: 3
              }}
            >
              {activeCategory === 'all' ? (
                <>
                  <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
                  All Frequently Asked Questions
                </>
              ) : (
                <>
                  {categories.find(cat => cat.id === activeCategory)?.icon}
                  <Box component="span" sx={{ ml: 1 }}>
                    {categories.find(cat => cat.id === activeCategory)?.label}
                  </Box>
                </>
              )}
              {searchTerm && (
                <Box component="span" sx={{ ml: 2, fontSize: '0.9rem', fontWeight: 'normal', color: 'text.secondary' }}>
                  Search results for: "{searchTerm}"
                </Box>
              )}
            </Typography>

            {/* No results message */}
            {filteredFAQs.length === 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  px: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <HelpIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  No matching FAQs found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try adjusting your search terms or category selection
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Reset Filters
                </Button>
              </Paper>
            )}

            {/* FAQ Accordions */}
            {filteredFAQs.map((faq) => (
              <Accordion 
                key={faq.id}
                sx={{ 
                  mb: 1, 
                  boxShadow: 'none', 
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '4px !important',
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Still Have Questions Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mt: 4, 
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <InfoIcon sx={{ color: 'primary.main', mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Still Have Questions?
                </Typography>
                <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
                  If you couldn't find the answer to your question, please feel free to contact the Barangay Maahas office directly.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/contact"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'none',
                    }}
                  >
                    Contact Us
                  </Button>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/contact"
                    size="small"
                    sx={{
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      fontWeight: 500,
                      textTransform: 'none',
                    }}
                  >
                    Visit Contact Page
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ResidentFAQs;