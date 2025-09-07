import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSignOut } from '../../lib/utils/onSignOut'; // 로그아웃

import useUserStore from '../../store/userStore';
import { useUIStore } from '../../store/uiStore'; // 🚀
import { useShallow } from 'zustand/react/shallow';

import styled from 'styled-components';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

export const Navbar = () => {
  const navigate = useNavigate();
  const { name, companyName } = useUserStore(useShallow(state => state));
  const toggleSidebar = useUIStore(state => state.toggleSidebar); // 🚀🚀

  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  useEffect(() => {
    console.log('isSidebarOpen changed:', isSidebarOpen);
  }, [isSidebarOpen]);

  const handleSignOut = async () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <Wrap>
      <NavbarWrap>
        {/* toggleSidebar 🚀 */}
        <ToggleWrap onClick={toggleSidebar}>
          <MenuRoundedIcon />
        </ToggleWrap>

        <UserWrap>
          <CompanyName>{companyName ? companyName : 'OO학원'}</CompanyName>
          <UserName onClick={() => navigate('/')}>
            {name ? name : '김원장'}
          </UserName>
          <LogOut onClick={handleSignOut}>로그아웃</LogOut>
        </UserWrap>
      </NavbarWrap>
    </Wrap>
  );
};

export const Wrap = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  width: 100%;
  color: white;
  z-index: 50;
`;

export const NavbarWrap = styled.div`
  display: flex;
  justify-content: space-between; /* space-between -> end 💚 */
  align-items: center; /* 추가 */
  padding: 0 1rem;
  width: 100%;
  height: ${({ theme }) => theme.navbar.height}; /* 네브바 높이 */
  /* border-bottom: solid 1px white; */
  background-color: ${({ theme }) => theme.mainColor.regular};
  font-size: 0.8rem; /* 네브바 폰트 크기 */
  font-weight: 400;

  @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export const ToggleWrap = styled.div`
  /* display: none; */
  /* display: block; */
  /* justify-content: center; */
  cursor: pointer;

  /* @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    display: block;
  } */
`;

export const UserWrap = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  /* right: 0; */
`;

export const CompanyName = styled.div`
  margin-right: 10px;
`;

export const UserName = styled.div`
  margin-right: 10px;
  cursor: pointer;
`;

export const LogOut = styled.div`
  cursor: pointer;
`;
