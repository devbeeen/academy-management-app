import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../supabaseClient';

// initial company code setup
export const Contents = () => {
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [companyList, setCompanyList] = useState([]);

  const [companyCode, setCompanyCode] = useState();
  const [companyName, setCompanyName] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    // 현재 로그인한 유저 정보 가져오기
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log('getUser-data', data);
      setLoggedInUser(data);
    };
    getUser();

    // 회사 데이터 불러오기(회사 코드 체크 위해)
    const fetchCompanyData = async () => {
      const { data, error } = await supabase.from('companies').select('*');
      console.log('companies-data: ', data);

      if (error) {
        console.error('Supabase 연동 실패:', error);
      }

      setCompanyList(data);
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const getCompanyCode = () => {
      const codeList = companyList.map(item => Number(item.company_code));

      let initial = 1;
      while (codeList.includes(initial)) {
        initial++;
      }
      setCompanyCode(initial);
    };

    getCompanyCode();
  }, [companyList]);

  console.log('companyList: ', companyList);
  console.log('loggedInUser: ', loggedInUser);

  const onCompanyCodeSetup = async e => {
    e.preventDefault();

    console.log('loggedInUser: ', loggedInUser);

    if (loggedInUser.user) {
      // await supabase.from('user_profile').insert({});
      const { data, error } = await supabase.from('user_profile').insert({
        id: loggedInUser.user.id,
        email: loggedInUser.user.email,
        company_code: companyCode.toString(),
        company_name: companyName,
      });

      if (error) {
        console.error('upsert 에러:', error);
      }

      // ---------------------------
      // 지금 로그인한 사용자가 이미 회사코드를 보유함 -> 등록하지 않음
      const loggedInUserId = loggedInUser.user.id;

      // 로그인한 사용자의 프로필 조회
      // const { data: existingProfile, error: profileError } = await supabase
      //   .from('user_profile')
      //   .select('company_code')
      //   .eq('id', loggedInUserId)
      //   .maybeSingle();
      // // .single();

      // console.log('existingProfile', existingProfile);

      // if (profileError) {
      //   console.error('프로필 조회 실패:', profileError);
      //   return;
      // }

      // // 회사코드가 이미 등록되어 있으면 중단
      // if (existingProfile && existingProfile.company_code) {
      //   console.log('이미 회사 코드가 등록된 사용자입니다.');
      //   return; // 등록 중단
      // }
      // ---------------------------

      // company_code를 -> 회사 테이블의 company_code로 insert
      const { error: companiesError } = await supabase
        .from('companies')
        .insert({
          created_by: loggedInUser.user.id,
          code: companyCode.toString(),
          name: companyName,
        });

      if (companiesError) {
        console.error('companies-insert 에러:', companiesError);
      }

      /*
      // await supabase.from('user_profile').insert({});
      const { data, error } = await supabase.from('user_profile').insert({
        id: loggedInUser.user.id,
        email: loggedInUser.user.email,
        company_code: companyCode.toString(),
        company_name: companyName,
      });

      if (error) {
        console.error('upsert 에러:', error);
      }

      // company_code를 -> 회사 테이블의 company_code로 insert
      const { error: companiesError } = await supabase
        .from('companies')
        .insert({
          created_by: loggedInUser.user.id,
          code: companyCode.toString(),
          name: companyName,
        });

      if (companiesError) {
        console.error('companies-insert 에러:', companiesError);
      }
      */
    }

    // const { data, error } = await supabase.from('user_profile').select('*');
    // // setSelectedUser(data);
    // console.log('data: ', data);
    // const dataFoo =
    //   loggedInUser.user &&
    //   data.filter(item => item.id === loggedInUser.user.id);

    // company_code를 -> 회사 테이블의 company_code로 insert
    const { error: companiesError } = await supabase.from('companies').upsert({
      code: companyCode.toString(),
      name: companyName,
    });

    if (companiesError) {
      console.error('companies-insert 에러:', companiesError);
    }
  };

  const companyValue = e => {
    setCompanyName(e.target.value);
  };

  return (
    <div>
      <div>학원 입력(초기) - 코드 발급</div>

      <label>학원명</label>
      <input
        placeholder="학원 이름을 입력해주세요"
        style={{ border: 'solid 1px black', height: '60px' }}
        onChange={companyValue}
      />
      <button
        label="확인"
        onClick={onCompanyCodeSetup}
        style={{ border: 'solid 1px black', width: '80px', height: '60px' }}
      >
        확인
      </button>
    </div>
  );
};
