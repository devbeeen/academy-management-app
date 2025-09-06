import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// import { useCategoryStore } from '../../store/categoryStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useShallow } from 'zustand/react/shallow';

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  // export const SideBar = ({ isSidebarOpen, closeSidebar }) => {

  const navigate = useNavigate();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [processedData, setProcessedData] = useState([]);

  const state = useCategoryStore(useShallow(state => state));
  const { categories } = useCategoryStore(useShallow(state => state));
  console.log('카테고리::: ', state);
  console.log('카테고리-categories::: ', categories);
  // setProcessedData(categories);

  const codeToPath = {
    C100: '/my-profile', // 내 프로필
    C101: '/member', // 수강생 정보
    C102: '/attendance', // 출결 관리
  };

  const codeOrder = {
    C100: 1,
    C101: 2,
    C102: 3,
  };

  /* fetchData(): 카테고리 데이터 API 요청 -> 기존 Sidebar 컴포넌트에셔 요청했던 것을 zustand에서 관리로 변경 */

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data, error } = await supabase.from('categories').select('*');

  //     if (error) {
  //       console.error('categories 테이블 가져오기 실패: ', error);
  //       return;
  //     }

  //     // processedData 생성(path 적용, order 정렬)
  //     const result = data
  //       .filter(item => ['C101', 'C102'].includes(item.code)) // 원하는 code만 필터
  //       .map(item => ({
  //         isOpen: false,
  //         name: item.name,
  //         code: item.code,
  //         parentCode: item.parent_id,
  //         path: codeToPath[item.code] ?? '',
  //       }))
  //       .sort(
  //         (a, b) => (codeOrder[a.code] ?? 999) - (codeOrder[b.code] ?? 999),
  //       );

  //     setProcessedData(result);
  //   };

  //   fetchData();
  // }, []);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function onClickCategory(path) {
    // console.log('path: ', path);
    navigate(`${path}`);
  }

  return (
    <Background
      // className={`background-${isSidebarOpen ? 'open' : ''}`}
      className={isSidebarOpen ? 'background-open' : 'background-close'}
      // onClick={closeSidebar}
    >
      {/* <Wrap className={`sidebar-${isSidebarOpen ? 'open' : 'close'}`}></Wrap> */}
      <Wrap
        // className={`sidebar-${isSidebarOpen ? 'open' : 'close'}`}
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

  &.background-close {
    position: fixed;
    display: flex;
    top: ${({ theme }) => theme.navbar.height};
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: rgba(100, 0, 0, 0.6);
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

  &.sidebar-open {
    margin-left: 0;

    @media (max-width: ${({ theme }) => theme.breakpoint.maxWidth}) {
    }
  }

  /* 기본 close 상태 */
  &.sidebar-close {
    margin-left: -${({ theme }) => theme.sidebar.width};
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
