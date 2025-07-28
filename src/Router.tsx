import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import InitialCompanySetupPage from './pages/InitialCompanySetupPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';

const Router = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/company-setup" element={<InitialCompanySetupPage />} />
          <Route path="/join" element={<SignUpPage />} />
          <Route path="/attendance" element={<AttendanceManagementPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
