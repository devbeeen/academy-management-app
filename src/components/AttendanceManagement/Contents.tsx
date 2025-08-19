// 수강생 등록 컴포넌트

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Contents as DailyAttendance } from '../DailyAttendance/Contents';
import { Modal } from '../../lib/UI/Modal/Modal';
import { toKST } from '../../lib/utils/toKST';

// import { DayPicker } from 'react-day-picker'; // react-day-picker 라이브러리
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // MUI 데이터 피커
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // MUI 데이터 피커
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // MUI 데이터 피커
import dayjs, { Dayjs } from 'dayjs';

export const Contents = () => {
  const [memberName, setMemberName] = useState(); // 수강생 이름(등록을 위한)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false); // 수강생 등록 모달

  // DatePicker 값 저장용 state
  const [dateValue, setDateValue] = useState<Dayjs | null>(dayjs());

  const targetYear = dateValue.year().toString().padStart(2, '0');
  const targetMonth = (dateValue.month() + 1).toString().padStart(2, '0');
  const targetDate = dateValue.date().toString().padStart(2, '0');

  console.log('공통-targetYear: ', targetYear);
  console.log('공통-targetYear: ', targetMonth);
  console.log('공통-targetYear: ', targetDate);

  // 👇 userStore(로그인 유저 정보) 불러오기 -----
  // const pullData = useUserStore(
  //   useShallow(state => ({
  //     name: state.id,
  //   })),
  // );
  const fetchUserStore = useUserStore(useShallow(state => state));
  console.log('fetchUserStore', fetchUserStore);
  // ☝ userStore(로그인 유저 정보) 불러오기 -----

  const currentCompanyID = fetchUserStore.companyID;

  const memberNameValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberName(e.target.value);
  };

  // onAddMember: 수강생 등록 함수
  const onAddMember = async () => {
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

  // onFetchMemberList: members 테이블 불러오기 (수강생 불러오기)
  /**
   * DB에 조인 요청 -> DB는 내부적으로 JOIN을 수행 -> 결과(중첩된 데이터)를 JSON 형태로 프론트에 돌려줌
   * 기본적으로 조인은 DB에서 이루어지는 쿼리 작업. 아래 코드는 프론트상에서 조인을 요청한 것.
   */
  const [memberList, setMemberList] = useState([]);
  const onFetchMemberList = async () => {
    const { data, error } = await supabase
      .from('members')
      .select(
        `*,
      attendance_date (
      *,
      attendance_status (*)
      )`,
      )
      .eq('company_id', currentCompanyID)
      .eq('attendance_date.date', `${targetYear}-${targetMonth}-${targetDate}`);
    // .eq('attendance_date.date', '2025-07-28');
    setMemberList(data);

    if (error) {
      console.error('members 테이블 가져오기 실패: ', error);
    }
  };

  // onProcessedData: 데이터 가공 -----
  /*
  // 실시간 데이터 감지시에는 활성
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentHoursToMinutes = Math.ceil(
    (Number(currentHours) * 60 + Number(currentMinutes)) / 10,
  );
  */

  /**
   * [MEMO] maxMinute: 하루를 10분 단위로 쪼갰을 때 수치.
   * - 총 144개(하루 24시 x 시간당 6칸).
   * - maxMinute 값은 143(배열 0~143).
   */
  const maxMinute = 143;
  const processedData = [];

  // 데이터 가공
  function onProcessedData() {
    if (memberList) {
      console.log('💬memberList:', memberList);

      memberList.forEach(memberItem => {
        const oneDayData = [];

        if (memberItem.attendance_date.length > 0) {
          console.log('🦅🦅🦅memberItem:', memberItem);

          /**
           * [MEMO] progressTime: 하루 총 시간 (하루 10분 단위 x 144개(maxMinute))
           * 1시간당 10분 단위로 나타내기로 결정 -> 하루(24시) x 시간당 6칸 = 총 144개
           */
          for (
            let progressTime = 0;
            progressTime <= maxMinute;
            progressTime++
          ) {
            memberItem.attendance_date.forEach(attendanceItem => {
              // console.log('attendanceItem: ', attendanceItem);

              let perTimeData = attendanceItem.attendance_status.map(
                statusItem => {
                  // console.log('statusItem: ', statusItem);

                  /**
                   * [MEMO] checkInTimeHour, checkInTimeMinute:
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
                    /**
                     * [MEMO] (Number(checkInTimeHour) * 60 + Number(checkInTimeMinute)) / 10):
                     * 1-1. Number(checkInTimeHour) = 출근(시간 단위)
                     * 1-2. Number(checkInTimeHour) * 60: 시간 단위를 분 단위로 환산. 시간에 60을 곱한다.
                     * 1-3. Number(checkInTimeMinute) = 출근(분 단위)
                     * 1-4. (Number(checkInTimeHour) * 60 + Number(checkInTimeMinute)):
                     * 분으로 환산한 시간과 + 분을 더해 총 시간을 구한다.
                     * 합산한 결과를 10으로 나누는 이유는, 화면에 10분 단위로 구현이 목표이기 때문.
                     */
                    (Number(checkInTimeHour) * 60 + Number(checkInTimeMinute)) /
                      10,
                  );

                  let processedCheckOutTime = 0;
                  if (statusItem.check_out_time !== '') {
                    // processedCheckOutTime = Math.floor( // 이전
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

                  // [TAG] 현재 시간 체크를 위한 조건 -----start
                  // 실시간으로 찍히는 경우 (퇴근 기록 없음)
                  /*
                  if (
                    statusItem.attendance_code === 'M100' &&
                    statusItem.check_out_time === '' &&
                    progressTime > currentHoursToMinutes
                  ) {
                    return (perTimeData = {
                      priority: 1,
                      time: progressTime,
                      statusName: '',
                      dataName: '퇴근 기록 없음',
                    });
                  }
                  */
                  // [TAG] 현재 시간 체크를 위한 조건 -----end

                  if (
                    /**
                     * [MEMO] 조건: 체크인-체크아웃 날짜 불일치
                     * Number(statusItem.check_in_time.slice(8, 10)) !== Number(statusItem.check_out_time.slice(8, 10))
                     */
                    statusItem.attendance_code === 'M100' &&
                    Number(toKST(statusItem.check_in_time)?.slice(8, 10)) !==
                      Number(toKST(statusItem.check_out_time)?.slice(8, 10)) &&
                    processedCheckInTime <= progressTime
                  ) {
                    return (perTimeData = {
                      // priority: 98, // 원본
                      priority: 100,
                      time: progressTime,
                      statusName: '불일치statusName-등원',
                      dataName: '불일치-등원',
                      statusColor: 'olive', // 🍔
                      hasData: true, // 🍔
                    });
                  } else if (
                    // [MEMO] 조건: 체크인-체크아웃 날짜 일치
                    statusItem.attendance_code === 'M100' &&
                    processedCheckInTime <= progressTime &&
                    processedCheckOutTime >= progressTime
                  ) {
                    // console.log('일치---등원');

                    return (perTimeData = {
                      // priority: 98, // 원본
                      priority: 100,
                      time: progressTime,
                      statusName: '일치statusName-등원',
                      dataName: '일치-등원',
                      statusColor: 'olive', // 🍔
                      hasData: true, // 🍔
                    });
                  } else {
                    // 뉴)
                    return (perTimeData = {
                      // priority: 99, // 원본
                      priority: 101,
                      time: progressTime,
                      statusName: '',
                      // dataName: '데이터없음',
                      hasData: false, // 🍔
                    });
                  }
                },
              );

              /**
               * [MEMO] priorityData:
               * 만약 동일한 시간대에 데이터가 들어온다면(데이터 중복시), sort로 정렬
               */
              const priorityData = perTimeData.sort(
                (a: { priority: number }, b: { priority: number }) => {
                  return a.priority - b.priority;
                },
              );
              oneDayData.push(priorityData[0]);
            });
          }
        } else {
          /**
           * [MEMO] else 부분:
           * - 0에서부터 23시까지 데이터가 아예 없는 경우. 하루 내역이 아예 없는 경우.
           */
          for (let processTime = 0; processTime <= maxMinute; processTime++) {
            const result = {
              time: processTime,
              statusName: 'statusName-출결기록없음',
            };

            oneDayData.push(result);
          }
        }

        const result = {
          id: memberItem.id,
          /**
           * attendance_date[0]가 있으면 -> attendanceDateID에 memberItem.attendance_date[0].id를 추가
           * 없으면 -> 아무 것도 추가하지 않음
           */
          ...(memberItem.attendance_date[0] && {
            attendanceDateId: memberItem.attendance_date[0].id,
          }),
          name: memberItem.name,
          ...(memberItem.attendance_date[0] && {
            date: memberItem.attendance_date[0].date,
          }), // 📢 새로운 추가: 날짜
          oneDayData: oneDayData,
        };
        processedData.push(result);
      });
    }
  }
  onProcessedData();

  // console.log('processedData: ', processedData);

  return (
    <div>
      출결 확인
      <div
        style={{
          display: 'flex',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* 달력 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dateValue}
              onChange={newValue => setDateValue(newValue)}
            />
          </LocalizationProvider>
        </div>
        <div>
          {isAddMemberOpen && (
            <Modal onClose={() => setIsAddMemberOpen(false)} width="500px">
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
                  style={{
                    width: '80px',
                    height: '60px',
                    border: 'solid 1px black',
                  }}
                  onClick={() => onAddMember()}
                >
                  등록
                </button>
                <button
                  style={{
                    width: '80px',
                    height: '60px',
                    border: 'solid 1px black',
                  }}
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  닫기
                </button>
              </div>
            </Modal>
          )}
          <button
            style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
            onClick={() => setIsAddMemberOpen(true)}
          >
            수강생 등록(모달)
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
      </div>
      <DailyAttendance
        attendanceData={processedData}
        year={targetYear}
        month={targetMonth}
        date={targetDate}
      />
    </div>
  );
};
