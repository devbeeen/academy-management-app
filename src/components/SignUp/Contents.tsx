// 회원가입

import React, { useState, useEffect } from 'react';

import { supabase } from '../../supabaseClient';

export const Contents = () => {
  const [userID, setUserID] = useState();
  const [userPW, setUserPW] = useState();

  const convertIdToEmail = (id: string) => `${id}@fake.com`;

  const currentDate = new Date(
    new Date().toString().split('GMT')[0] + ' UTC',
  ).toISOString();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 회원가입 요청 → 인증 메일 발송됨 (현재 인증 없이 가입 가능한 상태)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: userID,
      password: userPW,
      options: {
        data: {
          confirmed_at: currentDate,
          email_confirmed_at: currentDate,
        },
      },
    });
  };

  const idValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('입력: ', e.target.value);
    setUserID(e.target.value);
  };

  const pwValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('입력: ', e.target.value);
    setUserPW(e.target.value);
  };

  return (
    <>
      <form onSubmit={handleSignUp}>
        <div>회원가입 페이지</div>

        <div>
          <label>ID</label>
          <input
            placeholder="아이디(메일)를 입력해주세요"
            style={{ border: 'solid 1px black', height: '60px' }}
            onChange={idValue}
          />
        </div>

        <div>
          <label>PW</label>
          <input
            placeholder="비밀번호를 입력해주세요"
            style={{ border: 'solid 1px black', height: '60px' }}
            onChange={pwValue}
          />
        </div>

        <button
          label="회원가입"
          style={{ border: 'solid 1px black', height: '60px' }}
        >
          회원가입
        </button>
      </form>
      <button />
    </>
  );
};
