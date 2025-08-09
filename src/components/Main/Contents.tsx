import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../supabaseClient';
import { onSignOut } from '../../lib/utils/onSignOut'; // 로그아웃

import useUserStore from '../../store/userStore';

import { useShallow } from 'zustand/react/shallow';
import { persist } from 'zustand/middleware'; // persist 미들웨어

export const Contents = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState([]);

  // zustand를 활용하여 세션 스토리지에 로그인한 유저 정보 저장
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const getUser = async () => {
      // 현재 로그인한 유저 정보 가져오기
      const { data, error } = await supabase.auth.getUser();
      console.log('getUser-data', data);

      if (error) {
        console.error('유저 정보 가져오기 실패', error);
        return;
      }

      // 로그인한 유저에게(=데이터가 존재하는 유저에게), insert 시도 -> user_profile 테이블에 데이터 삽입
      if (data.user) {
        await supabase.from('user_profile').insert({
          id: data.user.id,
          email: data.user.email,
        });

        setUserList(data);
      } else {
        console.log('인증되지 않은 유저이므로 insert 차단');
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    // user_profile 테이블 데이터 가져오기
    const fetchUserData = async () => {
      const { data, error } = await supabase.from('user_profile').select('*');
      console.log('userData: ', userList.user && userList.user.id);
      console.log('data: ', data);

      if (error) {
        console.error('user_profile 가져오기 실패:', error);
      }

      const dataFoo =
        userList.user && data.filter(item => item.id === userList.user.id);
      setLoggedInUser(dataFoo);
    };

    fetchUserData();
  }, [userList]);

  useEffect(() => {
    const getUserSession = () => {
      // getUserSession(): zustand를 활용하여 세션 스토리지에 로그인한 유저 정보 저장
      console.log('✅✅loggedInUser: ', loggedInUser);

      if (loggedInUser && loggedInUser[0]) {
        setUser({
          id: loggedInUser[0].id,
          name: loggedInUser[0].name,
          companyID: loggedInUser[0].company_id,
          companyCode: loggedInUser[0].company_code,
          companyName: loggedInUser[0].company_name,
        });
      }
      console.log('!!! 정보 저장');
    };

    getUserSession();
  }, [loggedInUser]);

  console.log('loggedInUser: ', loggedInUser);

  if (loggedInUser && loggedInUser[0]) {
    // console.log('!loggedInUser[0].company_code 회사 코드 없음');
    if (!loggedInUser[0].company_code) return navigate('/company-setup');
  }

  // MEMO: 로그아웃
  const handleSignOut = async () => {
    onSignOut();
    navigate('/login');
  };

  const pullData = useUserStore(
    useShallow(state => ({
      name: state.name,
    })),
  );

  // const checkData = useUserStore(useShallow(state => Object.keys(state)));
  const checkData = () => {
    console.log('userStore 데이터 확인(name): ', pullData.name);
  };

  // 세션스토리지의 user-storage 삭제
  const deleteData = () => {
    localStorage.removeItem('user-storage');
  };

  return (
    <div>
      <button
        label="로그아웃"
        style={{ height: '60px', border: 'solid 1px black' }}
        onClick={handleSignOut}
      >
        로그아웃
      </button>

      <div>이름</div>

      <button
        label="저장된 데이터 확인"
        style={{ height: '60px', border: 'solid 1px black' }}
        onClick={checkData}
      >
        저장 확인
      </button>

      <button
        label="세션 정보 삭제"
        style={{ height: '60px', border: 'solid 1px black' }}
        onClick={deleteData}
      >
        세션 삭제
      </button>
    </div>
  );
};
