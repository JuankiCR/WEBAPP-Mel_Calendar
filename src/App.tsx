// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import GuestLayout from "./layouts/GuestLayout";
import DefaultLayout from "./layouts/DefaultLayout";
// import BottomNavLayout from "./layouts/BottomNavLayout";

import StartRedirect from "@/pages/StartRedirect";
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import AddNotaView from "@/pages/AddNotaView";
import UserConfig from "./pages/user/UserConfig";
import AboutPage from "@/pages/About";
import RequireAuth from "@/components/auth/RequireAuth";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* RUTA INICIAL */}
        <Route path="/" element={<StartRedirect />} />

        {/* PUBLICAS */}
        <Route path="/login" element={
          <GuestLayout>
            <LoginPage />
          </GuestLayout>
        }/>
        <Route path="/register" element={
          <GuestLayout>
            <RegisterPage />
          </GuestLayout>
        }/>

        {/* PRIVADAS */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <DefaultLayout>
                <AddNotaView />
              </DefaultLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/user/config"
          element={
            <RequireAuth>
              <DefaultLayout>
                <UserConfig />
              </DefaultLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/about"
          element={
            <RequireAuth>
              <DefaultLayout>
                <AboutPage/>
              </DefaultLayout>
            </RequireAuth>
          }
        />

        {/* CUALQUIER OTRA → REDIRECT */}
        <Route path="*" element={
          <GuestLayout>
            <StartRedirect />
          </GuestLayout>
        }/>
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
