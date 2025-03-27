import { useEffect } from "react";
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
import useAuthStore from "./store/authStore";
import Chatbot from "./components/clientpage/chatbot/chatbot";
import LoginHeader from "./components/header/loginHeader";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AdminLayout = ({ children }) => (
  <div className="layout-container admin">
    <Sidebar isAdmin={true} />
    <div className="content">
      <Header isAdmin={true} />
      {children}
      <Footer isAdmin={true} />
    </div>
  </div>
);

const ClientLayout = ({ children }) => (
  <div className="layout-container client">
    <div className="content no-left-padding">
      <Header isAdmin={false} />
      {children}
      <Footer isAdmin={false} />
      <Chatbot />
    </div>
  </div>
);


const App = () => {
  const { user } = useAuthStore();
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
              <LoginHeader />
              <LoginPage />
              <Footer className="no-left-padding" />
            </>
          }
        />

        {user ? (
          <>
            <Route
              path="/admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="info" element={<Info />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="/" element={<Home />} />
                  </Routes>
                </AdminLayout>
              }
            />

            <Route
              path="/client/*"
              element={
                <ClientLayout>
                  <Routes>
                    <Route path="sauna" element={<SaunaCalendar />} />
                    <Route path="laundry" element={<LaundryCalendar />} />
                    <Route path="info" element={<Info />} />
                    <Route path="complaint" element={<ClientComplaint />} />
                    <Route path="rooms" element={<RoomBooking />} />
                  </Routes>
                </ClientLayout>
              }
            />
          </>
        ) : (
          <Route path="/*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;