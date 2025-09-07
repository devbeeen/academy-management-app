import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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

import PrivateRoute from './components/PrivateRoute/PrivateRoute';

import useUserStore from './store/userStore';
import { useShallow } from 'zustand/react/shallow';

const Router = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const [currentUserData, setCurrentUserData] = useState();
  // const userData = useUserStore(useShallow(state => state).userData);
  // console.log('👍👍👍---라우터currentUserData:', currentUserData);
  // const userId = userData.id;

  const isAuth = () => {
    return !!userId;
  };

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

  return (
    <>
      <BrowserRouter>
        {/* <Navbar />
        <Sidebar /> */}

        {/* <Body> */}
        <Routes>
          {/* 인증 필요 라우트 - 인증 true인 사용자 대상 */}
          <Route element={<Layout />}>
            <Route path="/" element={<MainPage />} />
            {/* <Route path="/my-profile" element={<MainPage />} /> */}
            <Route path="/member" element={<MemberPage />} />
            <Route path="/attendance" element={<AttendanceManagementPage />} />
          </Route>

          {/* 인증 불필요 라우트 - 인증 false인 사용자 대상 */}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<SignUpPage />} />
          <Route path="/company-setup" element={<InitialCompanySetupPage />} />

          {/* <Route path="/join" element={<SignUpPage />} />
          <Route path="/member" element={<MemberPage />} />
          <Route path="/attendance" element={<AttendanceManagementPage />} />  */}
        </Routes>
        {/* </Body> */}
      </BrowserRouter>
    </>
  );
};

export default Router;

const Body = styled.div`
  display: flex;
  margin-top: ${({ theme }) =>
    theme.navbar.height}; /* 네브바의 height 감안 🎁55px */
  /* background-color: pink; 🎁주석 */
`;

const Contents = styled.div`
  margin-left: ${({ theme }) =>
    theme.sidebar.width}; /* 사이드바의 width 감안 🎁250px */
  width: 100vw;
  height: calc(
    100vh - ${({ theme }) => theme.navbar.height}
  ); /* 네브바의 height 감안 🎁55px */

  background-color: white;
  transition: 0.2s ease-out;
  /* min-width: 0; 🔥 🎁주석 */
  /* flex: 1; 사용X*/
  /* max-height: 0; 사용X*/

  @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    margin-left: 0; /* [MEMO] 사라진 사이드바 자리 채우기 */
    transition: 0.2s ease-out;
  }
`;

const Wrap = styled.div`
  padding: 30px 20px;
  /* background-color: gray; */
`;
