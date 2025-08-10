import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../supabaseClient';

// initial company code setup
export const Contents = () => {
  const [loggedInUser, setLoggedInUser] = useState([]); // 로그인 유저(최초 로그인)
  const [companyList, setCompanyList] = useState([]); // companies 테이블 데이터

  const [companyCode, setCompanyCode] = useState();
  const [companyName, setCompanyName] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    // 현재 로그인한 유저 정보 가져오기(auth)
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log('getUser-data', data);

      if (error) {
        console.error('getUser 불러오기 실패:', error);
      }

      setLoggedInUser(data);
    };

    // 회사 데이터 가져오기(회사 코드 체크 위해)(companies)
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
    console.log('🔥getCompanyCode 호출됨 111');
    // 회사 코드 체크 (앞 번호부터 차례로 체크하여 없는 번호가, 현재 회사의 code가 됨)
    const getCompanyCode = () => {
      console.log('🔥getCompanyCode 호출됨 222');
      // const codeList = companyList.map(item => Number(item.company_code));
      const codeList = companyList.map(item => Number(item.code));

      companyList.map(item => {
        console.log('🔥🔥codeList-item:', item.code);
        // console.log('🔥🔥includes 1?', item.company_code.includes(1));
      });

      let initial = 1;
      while (codeList.includes(initial)) {
        console.log('🔥initial: ', initial);
        initial++;
      }
      setCompanyCode(initial);
    };

    getCompanyCode();
  }, [companyList]);

  useEffect(() => {
    console.log('🔥companyList 변경:', companyList);
  }, [companyList]);

  useEffect(() => {
    console.log('🥰companyCode changed: ', companyCode);
  }, [companyCode]);

  console.log('companyList: ', companyList);
  console.log('loggedInUser: ', loggedInUser);

  const onCompanyCodeSetup = async e => {
    e.preventDefault();
    console.log('🌸loggedInUser: ', loggedInUser.user.id);
    console.log('🌸companyCode: ', companyCode);

    if (loggedInUser.user) {
      // user_profile 테이블에 upsert (정보 저장) (insert는 메인페이지(id, mail) -> 회사코드 없으면, 현재 페이지인 회사등록 페이지로)
      const { data, error } = await supabase.from('user_profile').upsert({
        // id: loggedInUser.user.id,
        // email: loggedInUser.user.email,
        company_code: companyCode.toString(),
        company_name: companyName,
      });

      if (error) {
        console.error('user_profile insert 에러:', error);
      }

      // 👇 현재 로그인한 사용자가 이미 회사 코드를 보유한 경우 -> 등록하지 않음 -----
      // 로그인한 사용자의 프로필 조회
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('company_code')
        .eq('id', loggedInUser.user.id)
        .maybeSingle();
      // .single();
      console.log('existingProfile', existingProfile);

      if (profileError) {
        console.error('user_profile 회사 코드 조회 실패:', profileError);
        return;
      }
      // ☝ 현재 로그인한 사용자가 이미 회사 코드를 보유한 경우 -> 등록하지 않음 -----

      // 👇 companies 테이블이 insert (정보 저장) -----
      const { error: companiesInsertError } = await supabase
        .from('companies')
        .insert({
          created_by: loggedInUser.user.id,
          code: companyCode.toString(),
          name: companyName,
        });

      if (companiesInsertError) {
        console.error('companies insert 에러:', companiesInsertError);
      }
      // ☝ companies 테이블이 insert (정보 저장) -----

      // 👇 companies 테이블에 저장된 회사 코드 조회 -----
      const { data: existingCompany, error: companyCheckError } = await supabase
        .from('companies')
        .select('code')
        .eq('code', companyCode)
        .maybeSingle();

      console.log('🧓🧓🧓existingCompany', existingCompany);
      // ☝ companies 테이블에 저장된 회사 코드 조회 -----

      // 👇 회사코드가 이미 등록되어 있으면 return -----
      // 회사코드가 이미 등록되어 있으면 중단
      console.error('🎅🎅:', existingProfile && existingProfile.company_code);
      console.error(
        '🎅🎅222:',
        existingProfile.company_code && existingCompany,
      );

      // if (existingProfile && existingProfile.company_code) {
      if (existingProfile.company_code && existingCompany) {
        console.log('이미 회사 코드가 등록된 사용자입니다.');
        return; // 등록 중단
      }
      // ☝ 회사코드가 이미 등록되어 있으면 return -----

      // navigate('/');
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
        style={{ height: '60px', border: 'solid 1px black' }}
        onChange={companyValue}
      />
      <button
        label="확인"
        onClick={onCompanyCodeSetup}
        style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
      >
        확인
      </button>
    </div>
  );
};
