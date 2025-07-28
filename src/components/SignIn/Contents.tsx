// 로그인

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { supabase } from '../../supabaseClient';

import * as S from './Contents.style';

export const Contents = () => {
  const navigate = useNavigate();

  const [userID, setUserID] = useState();
  const [userPW, setUserPW] = useState();

  const idValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('id 입력: ', e.target.value);
    setUserID(e.target.value);
  };
  console.log('userID: ', userID);

  const pwValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('pw 입력: ', e.target.value);
    setUserPW(e.target.value);
  };

  const onLogin = async e => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userID,
      password: userPW,
    });

    if (error) {
      console.error('로그인 실패: ', error.message);
      return;
    }

    navigate('/');
  };

  /*
  const onLogin = async e => {
    //
    await axios({
      url: `url`,
      method: 'post',
      data: {
        userID: userID,
        userPW: userPW,
      },
    }).then(res => {
      console.log('res.data: ', res.data);
    });
  };
  */

  return (
    <S.Section>
      <div>로그인 페이지</div>
      <S.Title>타이틀</S.Title>

      <S.LoginForm
      //onSubmit={onLogin}
      >
        <S.ItemBox>
          <label>ID</label>
          <input
            placeholder="아이디(메일)를 입력해주세요"
            style={{ border: 'solid 1px black', height: '60px' }}
            onChange={idValue}
          />
        </S.ItemBox>

        <S.ItemBox>
          <label>PW</label>
          <input
            placeholder="비밀번호를 입력해주세요"
            style={{ border: 'solid 1px black', height: '60px' }}
            onChange={pwValue}
          />
        </S.ItemBox>

        <button
          label="로그인"
          onClick={onLogin}
          style={{ border: 'solid 1px black', width: '80px', height: '60px' }}
        >
          로그인
        </button>
      </S.LoginForm>
      <button
        label="회원가입"
        onClick={() => navigate('/join')}
        style={{ border: 'solid 1px black', width: '80px', height: '60px' }}
      >
        회원가입
      </button>
      <button />
    </S.Section>
  );
};
