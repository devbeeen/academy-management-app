import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import styled from 'styled-components';

export const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [processedData, setProcessedData] = useState([]);

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

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('categories').select('*');

      if (error) {
        console.error('categories 테이블 가져오기 실패: ', error);
        return;
      }

      setCategoryList(data);

      const processed = data
        .map(item => ({
          isOpen: false,
          name: item.name,
          code: item.code,
          parentCode: item.parent_id,
          path: codeToPath[item.code] ?? '',
        }))
        .sort(
          (a, b) => (codeOrder[a.code] ?? 999) - (codeOrder[b.code] ?? 999),
        );

      setProcessedData(processed);
    };

    fetchData();
  }, []);

  function onClickCategory(path) {
    console.log('menu: ', path);
  }

  return (
    <Background
      className={`background-${isSidebarOpen ? 'open' : ''}`}
      onClick={closeSidebar}
    >
      <Wrap
        className={`sidebar-${isSidebarOpen ? 'open' : ''}`}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <WrapList>
          <CategoryUl>
            {processedData &&
              processedData.map((item, idx) => {
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
  &.background-open {
    position: fixed;
    display: flex;
    top: 50px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: gray;
    z-index: 100;

    @media (min-width: 800px) {
      visibility: hidden;
    }
  }
`;

const Wrap = styled.div`
  position: fixed;
  width: 220px;
  height: calc(100vh - 50px);
  color: white;
  z-index: 100;
  background-color: #e16fed;
  transition: 0.2s ease-out;

  &.sidebar-open {
    visibility: visible;
    margin-left: 0;

    @media (max-width: 800px) {
    }
  }

  @media (max-width: 800px) {
    margin-left: -220px;
    transition: 0.2s ease-out;
  }
`;

const WrapList = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
`;

const CategoryUl = styled.ul`
  height: 100%;
  font-size: 14px;
`;

const CategoryLi = styled.li`
  display: flex;
  align-items: center;
  height: 45px;
  padding: 1rem 1rem;
  background-color: purple;
  cursor: pointer;

  :hover {
    background-color: black;
  }

  &.none-path {
    display: none;
  }
`;
