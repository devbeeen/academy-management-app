import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import styled from 'styled-components';
import { Button } from '../../lib/UI/Button';

// initial company code setup
export const Contents = () => {
  const [loggedInUser, setLoggedInUser] = useState([]); // 로그인 유저(최초 로그인)
  const [companyList, setCompanyList] = useState([]); // companies 테이블 데이터

  const [companyCode, setCompanyCode] = useState();
  const [companyName, setCompanyName] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    // auth에서 현재 로그인한 유저 정보 가져오기(auth)
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      // console.log('getUser-data', data);

      if (error) {
        console.error('getUser 불러오기 실패:', error);
      }

      setLoggedInUser(data);
    };

    // companies 테이블에서 데이터 가져오기(회사 코드 체크 위해)
    const fetchCompanyData = async () => {
      const { data, error } = await supabase.from('companies').select('*');
      console.log('companies-data: ', data);

      if (error) {
        console.error('companies 불러오기 실패:', error);
      }

      setCompanyList(data);
    };

    getUser();
    fetchCompanyData();
  }, []);

  useEffect(() => {
    // 회사 코드 체크 (앞 번호부터 차례로 체크하여 없는 번호가, 현재 회사의 code가 됨)
    const getCompanyCode = () => {
      const codeList = companyList.map(item => Number(item.code));

      let initial = 1;
      while (codeList.includes(initial)) {
        console.log('initial: ', initial);
        initial++;
      }
      setCompanyCode(initial);
    };

    getCompanyCode();
  }, [companyList]);

  const onCompanyCodeSetup = async e => {
    e.preventDefault();

    if (!companyName) return alert('회사 이름을 입력해 주세요');

    if (loggedInUser.user) {
      // 👇 현재 로그인한 사용자가 이미 회사 코드를 보유한 경우 -> 등록하지 않음
      // 로그인한 사용자의 프로필 조회
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('company_code')
        .eq('id', loggedInUser.user.id)
        .maybeSingle();
      // .single();
      // console.log('existingProfile', existingProfile);

      if (profileError) {
        console.error('user_profile 회사 코드 중복:', profileError);
        return;
      }
      // ☝ 현재 로그인한 사용자가 이미 회사 코드를 보유한 경우 -> 등록하지 않음

      // 👇 companies 테이블에 저장된 회사 코드 조회
      const { data: existingCompany, error: companyCheckError } = await supabase
        .from('companies')
        // .select('code')
        .select('*')
        .eq('code', companyCode)
        .maybeSingle();

      // console.log('existingCompany', existingCompany);
      // ☝ companies 테이블에 저장된 회사 코드 조회

      // 👇 회사코드가 이미 등록되어 있으면 중단(return)
      console.error(
        'existingProfile.code:',
        existingProfile && existingProfile.code,
      );
      console.error(
        'existingCompany:',
        existingProfile.company_code && existingCompany,
      );

      // if (existingProfile && existingProfile.code) {
      if (existingProfile.code && existingCompany) {
        console.log('이미 회사 코드가 등록된 사용자입니다.');
        return;
      }
      // ☝ 회사코드가 이미 등록되어 있으면 중단(return)

      // 👇 user_profile 테이블에 upsert
      // 메인 페이지에서 insert로 id, mail 등록됨 -> 그리고 회사코드 없으면, 현재 페이지인 회사등록 페이지로 이동하게 됨
      const { data, error } = await supabase.from('user_profile').upsert({
        company_code: companyCode.toString(),
        company_name: companyName,
      });

      if (error) {
        console.error('user_profile upsert 에러:', error);
      }
      // ☝ user_profile 테이블에 upsert

      // 👇 companies 테이블에 insert(정보 저장)
      // 해당 코드 이후에 companies 테이블 행(=새 회사 데이터가 생성됨)
      const { data: newCompany, error: companiesInsertError } = await supabase
        .from('companies')
        .insert({
          created_by: loggedInUser.user.id,
          code: companyCode.toString(),
          name: companyName,
        })
        .select() // insert 후 생성된 데이터를 리턴(아래 user_profile테이블에 바로 업데이트 하기 위해)
        .single(); // 한 행만 받을 경우

      if (companiesInsertError) {
        console.error('companies insert 에러:', companiesInsertError);

        if (companiesInsertError.code === '23505') {
          alert('이미 등록된 회사입니다');
          return navigate('/');
        }
      }
      // ☝ companies 테이블에 insert(정보 저장)

      // 👇 새 회사 데이터 생긴 이후, user_profile의 company_id에 update
      const { data: savedCompany, error: savedCompanyError } = await supabase
        .from('user_profile')
        // .update({ company_id: existingCompany.id })
        .update({ company_id: newCompany.id })
        .eq('company_code', companyCode);

      if (savedCompanyError) {
        console.error('savedCompanyError: ', savedCompanyError);
      }
      // ☝ 새 회사 데이터 생긴 이후, user_profile의 company_id에 update

      alert('성공적으로 등록이 되었습니다.');
      navigate('/');
    }
  };

  const companyValue = e => {
    setCompanyName(e.target.value);
  };

  return (
    <Wrap>
      <Title>학원 입력(1회) : 고유 코드 발급</Title>

      <FormWrap>
        <ItemWrap>
          <ItemName>학원명</ItemName>
          <ItemInput
            placeholder="학원 이름을 입력해주세요"
            // onChange={companyValue}
            onChange={e => setCompanyName(e.target.value)}
          />
        </ItemWrap>
        {/* <button onClick={onCompanyCodeSetup}>등록</button> */}
        <Button handleClick={onCompanyCodeSetup} width="15rem">
          등록
        </Button>
      </FormWrap>
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
