import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import InitialCompanySetupPage from './pages/InitialCompanySetupPage';
import MainPage from './pages/MainPage';
import MemberPage from './pages/MemberPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';

import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';

import { useCategoryStore } from './store/categoryStore';

const Router = () => {
  // 로그인 후, 진입점(Router)에서 카테고리 API fetch
  useEffect(() => {
    // useCategoryStore.getState().fetchData();

    useCategoryStore
      .getState()
      .fetchData()
      .then(data => {
        // console.log('Router-fetchData: ', data);
      });
  }, []);

  function Layout() {
    return (
      <>
        <Navbar />
        <Body>
          <Sidebar />
          <Contents>
            <Wrap>
              <Outlet />
            </Wrap>
          </Contents>
        </Body>
      </>
    );
  }
  /* ✋ 정리 필요
  1.
    const handleSidebar = () => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      if (!isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

  2.
  const handleSidebar = () => {
    setIsSidebarOpen(prev => {
      console.log(prev ? 'isSidebarOpen-true' : 'isSidebarOpen-false');
      return !prev;
    });
  };
  */

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 인증 필요 라우트 - 인증 true인 사용자 대상 */}
          <Route element={<Layout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/member" element={<MemberPage />} />
            <Route path="/attendance" element={<AttendanceManagementPage />} />
          </Route>

          {/* 인증 불필요 라우트 - 인증 false인 사용자 대상 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<SignUpPage />} />
          <Route path="/company-setup" element={<InitialCompanySetupPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;

// 본문
const Body = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.navbar.height};
`;

const Contents = styled.div`
  width: 100vw;
  height: calc(100vh - ${({ theme }) => theme.navbar.height});

  background-color: white;
  transition: 0.2s ease-out;

  @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    transition: 0.2s ease-out;
  }
`;

const Wrap = styled.div`
  /* padding: 30px 1rem; */
  padding: 1.5rem 1rem;
`;
