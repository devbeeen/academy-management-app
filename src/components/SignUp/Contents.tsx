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
    // setError(null);
    // setSuccess(null);

    // const email = convertIdToEmail(userID);

    // ID 중복 확인: profiles 테이블에서 username 중복 체크
    /*
        const { data, error: checkError } = await supabase
          .from('user_profile')
          .select('mail')
          .eq('mail', userID);
        // .single();

        if (existingUser) {
          setError('이미 사용 중인 ID입니다.');
          console.log('이미 사용 중인 ID입니다.');
          return;
        }
      */

    // 회원가입 요청 → 인증 메일 발송됨 (현재 인증 없이 가입 가능한 상태)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: userID,
      password: userPW,
      options: {
        data: {
          // name: '임의 이름',
          confirmed_at: currentDate,
          email_confirmed_at: currentDate,
        },
      },
    });

    /*
    if (error || !data.email) {
      if (error.message.includes('User already registered')) {
        console.log('이미 가입된 이메일입니다.');
      } else {
        console.log('회원가입 실패:', error.message);
      }
    }

    if (signUpError || !data.user) {
      setError('회원가입 실패: ' + (signUpError?.message || '알 수 없는 오류'));
      return;
    }
    */

    // profiles 테이블에 ID 저장
    /*
      const { error: profileError } = await supabase
        .from('user_profile')
        .insert([{ id: userIdFoo, name: userIdFoo }]);

      if (profileError) {
        setError('프로필 저장 실패: ' + profileError.message);
        return;
      }
      */

    // setSuccess('가입 성공! 이메일 인증 후 로그인 가능합니다.');
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
