// 회원가입

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import styled from 'styled-components';
import { Button } from '../../lib/UI/Button';

export const Contents = () => {
  const navigate = useNavigate();

  const [userID, setUserID] = useState();
  const [userPW, setUserPW] = useState();

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const currentDate = new Date(
    new Date().toString().split('GMT')[0] + ' UTC',
  ).toISOString();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userID) return alert('ID를 입력해 주세요');
    if (!isValidEmail(userID)) return alert('이메일 형식이 올바르지 않습니다.');
    if (!userPW) return alert('PW를 입력해 주세요');

    // ID 중복 확인: profiles 테이블에서 username 중복 체크
    /* const { data: userProFileData, error: existingUser } = await supabase
      .from('user_profile')
      .select('mail')
      .eq('mail', userID);
    // .single();

    if (userProFileData) {
      alert('이미 사용 중인 ID입니다.');
      return;
    } */

    // 회원가입 요청 -> 인증 메일 발송됨(현재 인증 없이 가입 가능한 상태)
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

    /* if (signUpError) {
      console.error('signUpError 회원가입 에러: ', signUpError);
    } else {
      alert('성공적으로 가입이 되었습니다.');
      navigate('/');
    } */

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        alert('이미 가입된 이메일입니다.');
        return;
      }
      if (
        signUpError.message.includes('Password should be at least 6 characters')
      ) {
        alert('비밀번호는 6자리 이상을 입력해 주세요.');
        return;
      }
      alert('회원가입 실패: ' + signUpError.message);
      return;
    }

    alert('성공적으로 가입이 되었습니다.');
    navigate('/');

    /*
    if (error || !data.email) {
      if (error.message.includes('User already registered')) {
        console.log('이미 가입된 이메일입니다.');
      } else {
        console.log('회원가입 실패:', error.message);
      }
    }

    if (signUpError || !data.user) {
      alert('회원가입 실패: ' + (signUpError?.message || '알 수 없는 오류'));
      return;
    }
    */

    // profiles 테이블에 ID 저장
    /*
      const { error: profileError } = await supabase
        .from('user_profile')
        .insert([{ id: userIdFoo, name: userIdFoo }]);

      if (profileError) {
        alert('프로필 저장 실패: ' + profileError.message);
        return;
      }
      */

    // alert('가입 성공! 이메일 인증 후 로그인 가능합니다.');
  };

  return (
    <Wrap>
      <Title>회원가입</Title>

      <FormWrap onSubmit={handleSignUp}>
        {/* <ItemWrap>
          <ItemName>이름</ItemName>
          <ItemInput
            placeholder="이름을 입력해주세요"
            onChange={e => setUserName(e.target.value)}
          />
        </ItemWrap> */}

        <ItemWrap>
          <ItemName>ID</ItemName>
          <ItemInput
            placeholder="아이디(메일)를 입력해주세요"
            onChange={e => setUserID(e.target.value)}
          />
        </ItemWrap>

        <ItemWrap className="last-item">
          <ItemName>PW</ItemName>
          <ItemInput
            type="password"
            placeholder="비밀번호를 입력해주세요"
            onChange={e => setUserPW(e.target.value)}
          />
        </ItemWrap>

        {/* <button>회원가입</button> */}
        <Button handleClick={handleSignUp} width="15rem">
          확인
        </Button>
      </FormWrap>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '1rem',
          lineHeight: '1rem',
          color: 'gray',
          fontSize: '0.8rem',
        }}
      >
        <p>현재 테스트를 위해</p>
        <p>이메일 인증 없이 가입이 가능합니다</p>
      </div>
    </Wrap>
  );
};

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 5rem;
  height: 100%;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.mainColor.regular};
  font-size: 32px;
  font-weight: 600;
`;

const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  width: 15rem;
  font-size: 0.8rem;
`;

const ItemWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;

  &.last-item {
    margin-bottom: 2rem;
  }
`;

const ItemName = styled.div`
  width: 20%;
`;

const ItemInput = styled.input`
  padding-left: 0.4rem;
  width: 80%;
  height: 2.5rem;
  border: solid 1px ${({ theme }) => theme.color.gray};
  border-radius: 0.4rem;
  background-color: ${({ theme }) => theme.color.lightGrayLevel1};
  font-size: 0.8rem;

  &::placeholder {
    /* 플레이스홀더 스타일 */
    color: ${({ theme }) => theme.color.gray};
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.8;
  }
`;
