import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import './index.css';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AdminRoot from './pages/AdminRoot';
import AdminManageHomepage from './components/Admin/AdminManageHomepage.jsx';
import AdminHome from './components/Admin/AdminHome.jsx';
import AdminProfile from './components/Admin/AdminProfile.jsx';
import AdminAnnouncements from './components/Admin/AdminAnnouncements.jsx';
import AdminAccounts from './components/Admin/AdminAccounts.jsx';
import AdminDatabase from './components/Admin/AdminDatabase.jsx';
import AdminLogs from './components/Admin/AdminLogs.jsx';
import AdminRequestForms from './components/Admin/AdminRequestForms.jsx';
import AdminAmbulance from './components/Admin/AdminAmbulance.jsx';
import AdminCourt from './components/Admin/AdminCourt.jsx';
import AdminReport from './components/Admin/AdminReport.jsx';
import AdminProposal from './components/Admin/AdminProposal.jsx';
import ResidentRoot from './pages/ResidentRoot';
import Announcements from './components/Resident/Announcements.jsx';
import Services from './components/Resident/Services.jsx';
import FAQs from './components/Resident/FAQs.jsx';
import Contact from './components/Resident/Contact.jsx';
import ResidentProfile from './components/Resident/ResidentProfile.jsx';
import ResidentHome from './components/Resident/ResidentHome.jsx';
import ResidentRegistration from './components/Resident/ResidentRegistration.jsx';
import ResidentTransactions from './components/Resident/ResidentTransactions.jsx';
import ResidentAnnouncements from './components/Resident/ResidentAnnouncements.jsx';
import ResidentFAQs from './components/Resident/ResidentFAQs.jsx';
import ResidentContact from './components/Resident/ResidentContact.jsx';
import ResidentAmbulance from './components/Resident/ResidentAmbulance.jsx';
import ResidentCourt from './components/Resident/ResidentCourt.jsx';
import ResidentReport from './components/Resident/ResidentReport.jsx';
import ResidentProposal from './components/Resident/ResidentProposal.jsx';
import RequestID from './components/Resident/RequestID.jsx';
import RequestClearance from './components/Resident/RequestClearance.jsx';
import RequestBusiness from './components/Resident/RequestBusiness.jsx';
import RequestLot from './components/Resident/RequestLot.jsx';
import RequestDigging from './components/Resident/RequestDigging.jsx';
import RequestFencing from './components/Resident/RequestFencing.jsx';
import RequestAssistance from './components/Resident/RequestAssistance.jsx';
import RequestIndigency from './components/Resident/RequestIndigency.jsx';
import RequestResidency from './components/Resident/RequestResidency.jsx';
import RequestObjection from './components/Resident/RequestObjection.jsx';
import LandingRoot from './components/LandingRoot.jsx';
import LandingPage from './components/LandingPage';
import AdminContact from './components/Admin/AdminContact.jsx';
import API_BASE_URL from './config.js';

const checkIfLoggedInOnHome = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/checkifloggedin`, {
      method: "POST",
      credentials: "include" // Very important for cookies to be sent
    });

    const payload = await res.json();
    console.log(`checkIfLoggedInHome: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);
    
    if (payload.isLoggedIn) {
      if (payload.userType === "resident") {
        return redirect("/resident");
      } else if (payload.userType === "admin" || payload.userType === "superadmin") {
        return redirect("/admin");
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return null;
  }
}

const checkIfLoggedInOnDash = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/checkifloggedin`, {
      method: "POST",
      credentials: "include" // Very important for cookies to be sent
    });

    const payload = await res.json();
    console.log(`checkIfLoggedInOnDash: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);
    
    if (payload.isLoggedIn && (payload.userType === "admin" || payload.userType === "superadmin")) {
      return true;
    } else {
      return redirect("/");
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return redirect("/");
  }
}

const checkIfLoggedInOnResidentPage = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/checkifloggedin`, {
      method: "POST",
      credentials: "include" // Very important for cookies to be sent
    });

    const payload = await res.json();
    console.log(`checkIfLoggedInOnResidentPage: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);

    if (payload.isLoggedIn && payload.userType === "resident") {
      return true;
    } else {
      return redirect("/");
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return redirect("/");
  }
}

const router = createBrowserRouter([
  { path: '/', element: <LandingRoot />, loader: checkIfLoggedInOnHome, children:[
    { path: '/', element: <LandingPage />},
    { path: '/announcements', element: <Announcements />},
    { path: '/services', element: <Services />},
    { path: '/faqs', element: <FAQs />},
    { path: '/contact', element: <Contact />},
  ]},
  { path: '/signin', element: <SignIn />, loader: checkIfLoggedInOnHome},
  { path: '/signup', element: <SignUp />, loader: checkIfLoggedInOnHome},
  { path: '/resident', element: <ResidentRoot />, loader: checkIfLoggedInOnResidentPage, children:[
    { path: '/resident', element: <ResidentHome />},
    { path: '/resident/profile', element: <ResidentProfile />},
    { path: '/resident/announcements', element: <ResidentAnnouncements />},
    { path: '/resident/transactions', element: <ResidentTransactions />},
    { path: '/resident/faqs', element: <ResidentFAQs />},
    { path: '/resident/contact', element: <ResidentContact />},
    { path: '/resident/register-database', element: <ResidentRegistration />},
    { path: '/resident/services/ambulance', element: <ResidentAmbulance />},
    { path: '/resident/services/court', element: <ResidentCourt />},
    { path: '/resident/services/report', element: <ResidentReport />},
    { path: '/resident/services/proposal', element: <ResidentProposal />},
    { path: '/resident/services/request/id', element: <RequestID />},
    { path: '/resident/services/request/clearance', element: <RequestClearance />},
    { path: '/resident/services/request/business', element: <RequestBusiness />},
    { path: '/resident/services/request/lot', element: <RequestLot />},
    { path: '/resident/services/request/digging', element: <RequestDigging />},
    { path: '/resident/services/request/fencing', element: <RequestFencing />},
    { path: '/resident/services/request/assistance', element: <RequestAssistance />},
    { path: '/resident/services/request/indigency', element: <RequestIndigency />},
    { path: '/resident/services/request/residency', element: <RequestResidency />},
    { path: '/resident/services/request/objection', element: <RequestObjection />},
  ]},
  { path: '/admin', element: <AdminRoot />, loader: checkIfLoggedInOnDash, children:[
    {path: '/admin', element: <AdminHome />},
    {path: '/admin/profile', element: <AdminProfile />},
    {path: '/admin/announcements', element: <AdminAnnouncements />},
    {path: '/admin/accounts', element: <AdminAccounts />},
    {path: '/admin/database', element: <AdminDatabase />},
    {path: '/admin/logs', element: <AdminLogs />},
    {path: '/admin/services/request-forms', element: <AdminRequestForms />},
    {path: '/admin/services/ambulance-booking', element: <AdminAmbulance />},
    {path: '/admin/services/court-reservation', element: <AdminCourt />},
    {path: '/admin/services/infrastructure-reports', element: <AdminReport />},
    {path: '/admin/services/project-proposals', element: <AdminProposal />},
    {path: '/admin/contact-messages/', element: <AdminContact />},
    {
      path: '/admin/manage-app', 
      element: <AdminManageHomepage />,
      loader: async () => {
        const res = await fetch(`${API_BASE_URL}/checkifloggedin`, {
          method: "POST",
          credentials: "include" 
        });
    
        const payload = await res.json();
        if (payload.isLoggedIn && payload.userType === "superadmin") {
          return true;
        } else {
          return redirect("/admin");
        }
      }
    }
  ]},
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />    
    </ThemeProvider>
  </React.StrictMode>
);

