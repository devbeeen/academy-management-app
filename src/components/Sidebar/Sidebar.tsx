import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useCategoryStore } from '../../store/categoryStore';
import { useUIStore } from '../../store/uiStore'; // 🚀
import { useShallow } from 'zustand/react/shallow';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { categories } = useCategoryStore(useShallow(state => state));

  function onClickCategory(path) {
    navigate(`${path}`);
  }

  const isSidebarOpen = useUIStore(state => state.isSidebarOpen); // 🚀
  const toggleSidebar = useUIStore(state => state.toggleSidebar); // 🚀🚀

  return (
    <Background
      className={isSidebarOpen ? 'background-open' : 'background-close'}
      onClick={() => {
        if (isSidebarOpen) toggleSidebar(); // ✅ 열렸을 때만 닫히게
      }}
    >
      <Wrap
        className={isSidebarOpen ? 'sidebar-open' : 'sidebar-close'}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <WrapList>
          <CategoryUl>
            {categories &&
              categories.map((item, idx) => {
                return (
                  <CategoryLi
                    key={idx}
                    onClick={() => onClickCategory(item.path)}
                  >
                    {item.name}
                  </CategoryLi>
                );
              })}
          </CategoryUl>
        </WrapList>
      </Wrap>
    </Background>
  );
};

const Background = styled.div`
  ${({ theme }) => theme.disableDrag};
  /* 기본 close 상태 */

  &.background-open {
    position: fixed;
    display: flex;
    top: ${({ theme }) => theme.navbar.height};
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;

    @media (min-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
      /* visibility적용: 브라우저 width가 min-width를 넘을 경우, 배경 숨기기 */
      /* visibility: hidden; */
    }
  }
`;

/* box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3); */
const Wrap = styled.div`
  position: fixed;
  width: ${({ theme }) => theme.sidebar.width};
  height: calc(100vh - ${({ theme }) => theme.navbar.height});
  background-color: ${({ theme }) => theme.color.lightGrayLevel1};
  color: white;
  z-index: 100;
  transition: 0.2s ease-out;

  /* 기본 close 상태 */
  &.sidebar-close {
    margin-left: -${({ theme }) => theme.sidebar.width};
  }

  &.sidebar-open {
    margin-left: 0;

    @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    /* margin-left: 사이드바 사라짐 */
    /* margin-left: -${({ theme }) => theme.sidebar.width};
    transition: 0.2s ease-out; */
  }
`;

const WrapList = styled.div`
  overflow-x: hidden; /* 사이드바 스크롤 x축 */
  overflow-y: auto; /* 사이드바 스크롤 y축 */
`;

const CategoryUl = styled.ul`
  height: 100%; /* 해당 높이가 있어야 사이드바에 스크롤 생성 가능 */
  font-size: 14px;
`;

const CategoryLi = styled.li`
  display: flex;
  align-items: center;
  height: 45px;
  padding: 1rem 1rem;
  background-color: ${({ theme }) => theme.mainColor.regular};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.mainColor.dark};
  }
`;
