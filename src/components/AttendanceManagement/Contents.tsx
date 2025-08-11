// 수강생 등록 컴포넌트

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Contents as DailyAttendance } from '../DailyAttendance/Contents';

import { Modal } from '../../lib/UI/Modal/Modal';
import { toKST } from '../../lib/utils/toKST';

export const Contents = () => {
  const [memberName, setMemberName] = useState(); // 수강생 이름(등록을 위한)
  const [isOpen, setIsOpen] = useState(false); // 출결시간 등록 모달
  const [attendanceData, setAttendanceData] = useState([]);

  // 👇 userStore(로그인 유저 정보) 불러오기
  const fetchUserStore = useUserStore(useShallow(state => state));
  console.log('fetchUserStore', fetchUserStore);
  // ☝ userStore(로그인 유저 정보) 불러오기

  const currentCompanyID = fetchUserStore.companyID;
  // console.log('fetchUserStore.companyID: ', companyID);

  const memberNameValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('member name 입력: ', e.target.value);
    setMemberName(e.target.value);
  };

  // 👇 수강생 등록 함수
  const onRegisterMember = async () => {
    const { data, error } = await supabase
      .from('members') // 테이블명
      .insert([
        {
          name: memberName,
          company_id: currentCompanyID,
        },
      ]);

    if (error) {
      console.error('수강생 등록 실패:', error.message);
    } else {
      console.log('수강생 등록 성공:', data);
    }
  };
  // ☝ 수강생 등록 함수
  const [memberList, setMemberList] = useState([]);
  const onFetchMemberList = async () => {
    const { data, error } = await supabase
      .from('members')
      .select(
        `*,
      attendance (
      *,
      attendance_status (*)
      )`,
      )
      .eq('company_id', currentCompanyID);
    setMemberList(data);

    console.log('members 테이블 데이터:', data);

    if (error) {
      console.error('members 테이블 가져오기 실패: ', error);
    }
  };

  const maxMinute = 143;

  for (let i = 0; i <= maxMinute; i++) {
    tableHeader.push({
      time: i,
    });
  }

  const processedData = [];

  function onProcessedData() {
    if (memberList) {
      console.log('💬memberList:', memberList);

      memberList.forEach(memberItem => {
        const oneDayData = [];

        if (memberItem.attendance.length > 0) {
          for (
            let progressTime = 0;
            progressTime <= maxMinute;
            progressTime++
          ) {
            memberItem.attendance.forEach(attendanceItem => {
              // 🔥🔥🔥
              let perTimeData = attendanceItem.attendance_status.map(
                statusItem => {
                  /**
                   * checkInTimeHour, checkInTimeMinute:
                   * 시작 시간(시, 분 단위)만 추출 + undefined인 경우 빈 문자열 반환(분기 처리).
                   */
                  // 2025-07-28T09:30:00+00:00
                  const checkInTimeHour = statusItem.check_in_time
                    ? toKST(statusItem.check_in_time).slice(11, 13)
                    : '';
                  const checkInTimeMinute = statusItem.check_in_time
                    ? toKST(statusItem.check_in_time).slice(14, 16)
                    : '';
                  const checkOutTimeHour = statusItem.check_out_time
                    ? toKST(statusItem.check_out_time).slice(11, 13)
                    : '';
                  const checkOutTimeMinute = statusItem.check_out_time
                    ? toKST(statusItem.check_out_time).slice(14, 16)
                    : '';

                  const processedCheckInTime = Math.ceil(
                    (Number(checkInTimeHour) * 60 + Number(checkInTimeMinute)) /
                      10,
                  );

                  let processedCheckOutTime = 0;
                  if (statusItem.check_out_time !== '') {
                    processedCheckOutTime = Math.ceil(
                      (Number(checkOutTimeHour) * 60 +
                        Number(checkOutTimeMinute)) /
                        10,
                    );
                  } else {
                    processedCheckOutTime = maxMinute;
                  }

                  if (processedCheckInTime > processedCheckOutTime) {
                    processedCheckOutTime = maxMinute;
                  }

                  if (
                    /**
                     * 조건: 체크인-체크아웃 날짜 불일치
                     * Number(statusItem.check_in_time.slice(8, 10)) !== Number(statusItem.check_out_time.slice(8, 10))
                     */
                    statusItem.attendance_code === 'M100' &&
                    Number(statusItem.check_in_time.slice(8, 10)) !==
                      Number(statusItem.check_out_time.slice(8, 10)) &&
                    processedCheckInTime <= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 98,
                      time: progressTime,
                      statusName: '불일치statusName-출근',
                      dataName: '출근',
                    });
                  } else if (
                    // 조건: 체크인-체크아웃 날짜 일치
                    statusItem.attendance_code === 'M100' &&
                    processedCheckInTime <= progressTime &&
                    processedCheckOutTime >= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 100,
                      time: progressTime,
                      statusName: '일치statusName-출근',
                      dataName: '출근',
                    });
                  } else {
                    return (perTimeData = {
                      priority: 101,
                      time: progressTime,
                      statusName: '',
                    });
                  }
                },
              );

              // priorityData: 만약 동일한 시간대에 데이터가 들어온다면(데이터 중복), sort로 정렬

              const priorityData = perTimeData.sort(
                (a: { priority: number }, b: { priority: number }) => {
                  return a.priority - b.priority;
                },
              );
              oneDayData.push(priorityData[0]);
            });
          }
        } else {
          // else 부분: 0에서부터 23시까지 데이터가 아예 없는 경우. 하루 내역이 아예 없는 경우
          for (let processTime = 0; processTime <= maxMinute; processTime++) {
            const result = {
              time: processTime,
              statusName: 'statusName-근무없음',
            };

            oneDayData.push(result);
          }
        }

        const result = {
          oneDayData: oneDayData,
        };
        processedData.push(result);
      });
    }
  }
  onProcessedData();

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
          // onClick={() => onRegisterMember()}
        >
          등록
        </button>
      </div>
      <div>
        <button
          style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
          onClick={() => onFetchMemberList()}
        >
          수강생 불러오기
        </button>
      </div>
      <button
        label="출결시간 등록"
        style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
        onClick={() => setIsOpen(true)}
      >
        출결시간 등록
      </button>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} width="500px">
          <div>회원가입</div>
          <p>여기에 회원가입 폼이나 다른 내용을 넣을 수 있음</p>

          <div>
            <button
              style={{
                width: '80px',
                height: '60px',
                border: 'solid 1px black',
              }}
              // onClick={}
            >
              저장
            </button>
            <button
              style={{
                width: '80px',
                height: '60px',
                border: 'solid 1px black',
              }}
              onClick={() => setIsOpen(false)}
            >
              닫기
            </button>
          </div>
        </Modal>
      )}
      {/* <DailyAttendance attendanceData={attendanceData} /> */}
    </div>
  );
};
