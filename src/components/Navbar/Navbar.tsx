import React, { useState } from 'react';

import styled from 'styled-components';

export const Navbar = () => {
  // 🌸🌸🌸🌸🌸🌸🌸🍟🍟🍟🍟🍟❤❤❤🌸🌸🌸🌸🌸🌸

  return (
    <Wrap>
      <NavbarWrap>
        <ToggleWrap>
          <div>토글아이콘</div>
        </ToggleWrap>
        <TitleWrap>
          <CompanyInfoSection>OO학원</CompanyInfoSection>
        </TitleWrap>

        <UserSection>
          <ManualSection>아이콘</ManualSection>
          <UserInfoSection>홍길동</UserInfoSection>
          로그아웃버튼
        </UserSection>
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
  color: blue;
  z-index: 50;
`;

export const NavbarWrap = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 25px;
  border-bottom: solid 1px red;
  background-color: orange;
  font-size: 14px;
  font-weight: 400;

  @media (max-width: 800px) {
    display: flex;
    align-items: center;
  }
`;

export const ToggleWrap = styled.div`
  display: none;
  justify-content: center;

  @media (max-width: 800px) {
    display: block;
    cursor: pointer;
  }
`;

export const TitleWrap = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 800px) {
    display: none;
  }
`;

export const CompanyInfoSection = styled.div`
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`;

export const Logo = styled.img`
  height: 30px;
  margin-right: 5px;
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;

  right: 0;

  div {
    display: flex;
    align-items: center;
    text-align: center;
    margin-right: 10px;

    p {
      margin-right: 2px;
      font-weight: 500;
    }
  }
`;

export const ManualSection = styled.div`
  cursor: pointer;

  :hover {
    color: olive;
  }
`;

export const UserInfoSection = styled.div`
  p {
    &.user-name {
      color: green;
      font-weight: 500;
    }
    &.apartment-name {
      color: red;
      font-weight: 500;
    }
  }
`;
