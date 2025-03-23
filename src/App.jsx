import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import LoginPage from "./components/loginpage/loginPage";
import Home from './components/dashboard/home/home';  
import Rooms from "./components/dashboard/rooms/rooms";
import Reports from "./components/dashboard/reports/reports";
import Bookings from "./components/dashboard/bookings";
import Info from "./components/dashboard/info/info";
import Complaints from "./components/dashboard/complaints";
import SaunaCalendar from "./components/clientpage/sauna/sauna";
import ClientComplaint from "./components/clientpage/clientcomplaint/clientcomplaint";
import TvView from "./components/TV/tv";
import RoomBooking from "./components/clientpage/roomBooking/roomBooking";
import LaundryCalendar from "./components/clientpage/laundry/laundry";
import EventsPage from "./components/dashboard/events/events";
import useDataStore from "./services/data";
import useAuthStore from "../../Backend/src/store/authStore";
import Chatbot from "./components/clientpage/chatbot/chatbot";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedRoutes = ({ user }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (!user) {
    return null;
  }

  const isAdmin = user?.isAdmin;

  return (
    <div className={`layout-container ${isAdmin ? "admin" : "client"}`}>
      {!isLoginPage && <Header isAdmin={isAdmin} />}
      {isAdmin && <Sidebar isAdmin={isAdmin}/>}

      <div className={`content ${!isAdmin ? "no-left-padding" : ""}`}>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/admin" element={<Home />} />
              <Route path="/admin/rooms" element={<Rooms />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/bookings" element={<Bookings />} />
              <Route path="/admin/info" element={<Info />} />
              <Route path="/admin/complaints" element={<Complaints />} />
              <Route path="/admin/events" element={<EventsPage/>} />
            </>
          ) : (
            <>
              <Route path="/client/sauna" element={<SaunaCalendar />} />
              <Route path="/client/laundry" element={<LaundryCalendar/>} />
              <Route path="/client/info" element={<Info />} />
              <Route path="/client/complaint" element={<ClientComplaint />} />
              <Route path="/client/rooms" element={<RoomBooking/>} />
            </>
          )}
        </Routes>
      </div>

      {!isLoginPage && <Footer isAdmin={isAdmin}/>}
      {!isAdmin && <Chatbot />} 
    </div>
  );
};

const App = () => {
  const { user } = useAuthStore();
  const isLoginPage = location.pathname === "/login";
  const { fetchHumidityStream, fetchTemperatureStream, fetchWeatherData, startWeatherDataInterval } = useDataStore();

  useEffect(() => {
    fetchHumidityStream();
    fetchTemperatureStream();
    fetchWeatherData();
    startWeatherDataInterval();
  }, [fetchHumidityStream, fetchTemperatureStream, fetchWeatherData, startWeatherDataInterval]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/tv" element={<TvView />} />
        <Route
          path="/login"
          element={
            <>
              <Header />
              <LoginPage />
              <Footer className={isLoginPage ? 'no-left-padding' : ''}/>
            </>
          }
        />
        <Route
          path="/*"
          element={user ? <ProtectedRoutes user={user} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;