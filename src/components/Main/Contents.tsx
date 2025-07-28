import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../supabaseClient';
import { onSignOut } from '../../lib/utils/onSignOut'; // 로그아웃

export const Contents = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState([]);

  useEffect(() => {
    /*
    const runSequence = async () => {
      await getUser();
      await fetchUserData();
    };
    */

    const getUser = async () => {
      // 현재 로그인한 유저 정보 가져오기
      const { data, error } = await supabase.auth.getUser();
      console.log('getUser-data', data);

      if (error) {
        console.error('유저 정보 가져오기 실패', error);
        return;
      }

      // 로그인한 유저에게(=데이터가 존재하는 유저에게), insert 시도
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

    /*
    const fetchUserData = async () => {
      const { data, error } = await supabase.from('user_profile').select('*');
      console.log('data: ', data);

      if (error) {
        console.error('Supabase 연동 실패:', error);
      }
    };
    */

    getUser();
    // fetchUserData();
    // runSequence();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.from('user_profile').select('*');
      console.log('🍜userData: ', userList.user && userList.user.id);
      console.log('🍜data: ', data);

      if (error) {
        console.error('Supabase 연동 실패:', error);
      }

      const dataFoo =
        userList.user && data.filter(item => item.id === userList.user.id);
      setLoggedInUser(dataFoo);
    };

    fetchUserData();
  }, [userList]);

  /*
  if (loggedInUser && !loggedInUser.company_code) {
    console.log('회사코드 없음');
    // navigate('/company-setup');
  }
  */

  // console.log('💻💻: ', loggedInUser && !loggedInUser.company_code);
  console.log('🍟🍟loggedInUser: ', loggedInUser && loggedInUser);
  console.log(
    '🍟loggedInUser-company_Code: ',
    loggedInUser && loggedInUser[0]?.company_code,
  );

  // MEMO: 로그아웃
  const onSignOut = async () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <div>
      <button
        label="로그아웃"
        style={{ border: 'solid 1px black', height: '60px' }}
        onClick={onSignOut}
      >
        로그아웃
      </button>

      <div>이름</div>
    </div>
  );
};
