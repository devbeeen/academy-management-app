import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';
import { onSignOut } from '../../lib/utils/onSignOut'; // 로그아웃

import styled from 'styled-components';

export const Contents = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState([]);

  // zustand를 활용하여 세션 스토리지에 로그인한 유저 정보 저장
  const setUser = useUserStore(state => state.setUser);

  const fetchUserStoreData = useUserStore(
    useShallow(state => ({
      name: state.name,
      companyName: state.companyName,
    })),
  );

  // 👇 회사코드 없으면, 초기 회사 설정 페이지로 이동
  useEffect(() => {
    if (loggedInUser && loggedInUser[0]) {
      if (!loggedInUser[0].company_code) {
        alert('회사 설정을 먼저 해주세요');
        navigate('/company-setup');
      }
    }
  }, [loggedInUser, navigate]);
  // ☝ 회사코드 없으면, 초기 회사 코드 설정 페이지로 이동

  useEffect(() => {
    const getUser = async () => {
      // 현재 로그인한 유저 정보 가져오기
      const { data, error } = await supabase.auth.getUser();
      // console.log('getUser-data', data);

      if (error) {
        console.error('유저 정보 가져오기 실패', error);
        return;
      }

      // 로그인한 유저에게(=인증 데이터가 존재하는 유저에게), insert -> user_profile 테이블에 데이터 추가
      if (data.user) {
        await supabase.from('user_profile').insert({
          id: data.user.id,
          email: data.user.email,
        });

        setUserList(data);
      } else {
        console.log('인증되지 않은 유저입니다(insert 차단)');
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    // user_profile 테이블 데이터 가져오기
    const fetchUserData = async () => {
      const { data, error } = await supabase.from('user_profile').select('*');

      if (error) {
        console.error('user_profile 가져오기 실패:', error);
      }

      const fetchUserProfile =
        userList.user && data.filter(item => item.id === userList.user.id);
      setLoggedInUser(fetchUserProfile);

      // zustand를 활용하여 세션 스토리지에 로그인한 유저 정보 저장
      // const setUser = useUserStore(state => state.setUser);
    };

    fetchUserData();
  }, [userList]);

  useEffect(() => {
    const getUserSession = () => {
      // getUserSession(): zustand + persist로 세션 스토리지에 로그인한 유저 정보 저장
      // console.log('loggedInUser: ', loggedInUser);

      if (loggedInUser && loggedInUser[0]) {
        setUser({
          id: loggedInUser[0].id,
          name: loggedInUser[0].name,
          companyID: loggedInUser[0].company_id,
          companyCode: loggedInUser[0].company_code,
          companyName: loggedInUser[0].company_name,
        });
      }
      // console.log('userStore에 유저 정보 저장 성공');
    };

    getUserSession();
  }, [loggedInUser]);

  return (
    <div>
      <Title>
        {fetchUserStoreData.companyName
          ? fetchUserStoreData.companyName
          : '안녕하세요!'}
      </Title>
    </div>
  );
};

const Title = styled.div`
  color: ${({ theme }) => theme.mainColor.regular};
  font-size: 32px;
  font-weight: 600;
`;
