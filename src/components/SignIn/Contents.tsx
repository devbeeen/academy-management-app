// 로그인

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import styled from 'styled-components';
import { Button } from '../../lib/UI/Button';

export const Contents = () => {
  const navigate = useNavigate();

  const [userID, setUserID] = useState();
  const [userPW, setUserPW] = useState();

  const onLogin = async () => {
    // e.preventDefault();

    if (!userID) return alert('아이디를 입력해주세요');
    if (!userPW) return alert('비밀번호를 입력해주세요');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userID,
      password: userPW,
    });

    if (error) {
      console.error('로그인 실패: ', error.message);
      alert('로그인을 다시 시도해주세요');
      return;
    }

    navigate('/');
  };

  return (
    <Wrap>
      <Title>수업 출결 관리</Title>

      <LoginWrap
      // onSubmit={onLogin}
      >
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

        <Button handleClick={onLogin}>로그인</Button>
      </LoginWrap>
      <Bar />
      <Button handleClick={() => navigate('/join')} width="15rem">
        회원가입
      </Button>

      <div
        style={{
          marginTop: '1rem',
          lineHeight: '1rem',
          color: 'gray',
          fontSize: '0.8rem',
        }}
      >
        <p>테스트 계정 ID: test140@fake.com</p>
        <p>테스트 계정 PW: aaaaaa</p>
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
  color: ${({ theme }) => theme.mainColor.regular};
  font-size: 32px;
  font-weight: 600;
`;

const LoginWrap = styled.div`
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

const Bar = styled.div`
  margin: 20px 0;
  width: 12rem;
  border-bottom: solid 1px ${({ theme }) => theme.color.lightGrayLevel2};
`;
