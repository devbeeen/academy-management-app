// 수강생 등록 컴포넌트

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Contents as DailyAttendance } from '../DailyAttendance/Contents';

export const Contents = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [memberName, setMemberName] = useState();

  // 👇 userStore(로그인 유저 정보) 불러오기 -----
  const pullData = useUserStore(useShallow(state => state));
  console.log('pullData', pullData);
  // ☝ userStore(로그인 유저 정보) 불러오기 -----

  const companyID = pullData.companyID;
  console.log('companyID: ', companyID);

  useEffect(() => {
    const getAttendanceData = async () => {
      const { data, error } = await supabase.from('attendance').select('*');
      console.log('data: ', data);

      if (error) {
        console.error('attendance 불러오기 실패:', error);
      }

      setAttendanceData(data);
    };

    getAttendanceData();
  }, []);

  const memberNameValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('member name 입력: ', e.target.value);
    setMemberName(e.target.value);
  };

  // 수강생 등록 함수
  // const registerStudent = async (memberName: string) => {
  const registerStudent = async () => {
    const { data, error } = await supabase
      .from('members') // 테이블명
      .insert([
        {
          name: memberName,
          company_id: 'b20854a3-d3b6-4018-a63c-038274a6e7ed',
        },
      ]);

    if (error) {
      console.error('수강생 등록 실패:', error.message);
    } else {
      console.log('수강생 등록 성공:', data);
    }
  };

  // 사용 예시 (버튼 클릭 등에서 호출)
  // registerStudent();

  return (
    <div>
      근태/출결 관리
      <div style={{ width: '400px', border: 'solid 1px black' }}>
        <div>수강생 등록</div>
        <div>
          <label>이름</label>
          <input
            placeholder="이름을 입력해주세요"
            style={{ height: '60px', border: 'solid 1px black' }}
            onChange={memberNameValue}
          />
        </div>
        <button
          label="수강생 등록"
          style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
          // onClick={() => registerStudent()}
        >
          등록
        </button>
      </div>
      <DailyAttendance attendanceData={attendanceData} />
    </div>
  );
};

/*
  const TitleBox = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5mm;
  margin-bottom: 5.8mm;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  `;

  const ApprovalListSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
  width: 100%;
  height: 30px;
  `;

  const CategoryTitleBox = styled.div`
  display: flex;
  align-items: center;
  margin-left: 5px;
  width: 80px;
  height: 40px;
  border-right: solid 1px ${({ theme }) => theme.backgroundColor.gray};
`;
  */
