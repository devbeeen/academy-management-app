import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CompanyIDSetup from './pages/CompanyIDSetupPage';

const Router = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/company-setup" element={<CompanyIDSetup />} />
          <Route path="/join" element={<SignUpPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
