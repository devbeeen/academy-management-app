// 수강생 등록 컴포넌트

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Contents as DailyAttendance } from '../DailyAttendance/Contents';
import { Button } from '../../lib/UI/Button';
import { toKST } from '../../lib/utils/toKST';

// import { DayPicker } from 'react-day-picker'; // react-day-picker 라이브러리
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // MUI 데이터 피커
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // MUI 데이터 피커
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // MUI 데이터 피커
import dayjs, { Dayjs } from 'dayjs';

import { TextField } from '@mui/material';

import styled from 'styled-components';

export const Contents = () => {
  // DatePicker 값 저장용 state
  const [dateValue, setDateValue] = useState<Dayjs | null>(dayjs());

  const targetYear = dateValue.year().toString().padStart(2, '0');
  const targetMonth = (dateValue.month() + 1).toString().padStart(2, '0');
  const targetDate = dateValue.date().toString().padStart(2, '0');

  // [TAG] fetchUserStore: userStore(로그인한 유저 정보 store) 불러오기
  const fetchUserStore = useUserStore(useShallow(state => state));
  const currentCompanyID = fetchUserStore.companyID;

  // [TAG] onFetchMemberList(): members 테이블 불러오기(수강생 불러오기)
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

  /**
   * maxMinute: 하루를 10분 단위로 쪼갰을 때 수치.
   * - 총 144개(하루 24시 x 시간당 6칸).
   * - maxMinute 값은 143(배열 0~143).
   */
  const maxMinute = 143;
  const processedData = [];

  /*
  // 실시간 데이터 감지시에는 활성
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentHoursToMinutes = Math.ceil(
    (Number(currentHours) * 60 + Number(currentMinutes)) / 10,
  );
  */

  // [TAG] onProcessedData(): 데이터 가공
  function onProcessedData() {
    if (memberList) {
      // console.log('AttendanceManagement-memberList:', memberList);

      memberList.forEach(memberItem => {
        const oneDayData = [];

        if (memberItem.attendance_date.length > 0) {
          /**
           * progressTime: 하루 총 시간 (하루 10분 단위 x 144개(maxMinute))
           * 1시간당 10분 단위로 나타내기로 결정 -> 하루(24시) x 시간당 6칸 = 총 144개
           */
          for (
            let progressTime = 0;
            progressTime <= maxMinute;
            progressTime++
          ) {
            memberItem.attendance_date.forEach(attendanceItem => {
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
                    /**
                     * (Number(checkInTimeHour) * 60 + Number(checkInTimeMinute)) / 10):
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

                  // [TAG] 현재 시간 체크를 위한 조건
                  // 실시간으로 찍히는 경우(수업 종료 기록 없음)
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
                      dataName: '데이터 없음',
                    });
                  }
                  */

                  if (
                    /**
                     * [TAG] 조건: 체크인-체크아웃 날짜 불일치
                     * Number(statusItem.check_in_time.slice(8, 10)) !== Number(statusItem.check_out_time.slice(8, 10))
                     */
                    statusItem.attendance_code === 'M100' &&
                    Number(toKST(statusItem.check_in_time)?.slice(8, 10)) !==
                      Number(toKST(statusItem.check_out_time)?.slice(8, 10)) &&
                    processedCheckInTime <= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 100,
                      time: progressTime,
                      statusName: '불일치(statusName)-등원',
                      dataName: '불일치-등원',
                      statusColor: '#cdcdcd', // 추가
                      hasData: true, // 추가
                    });
                  } else if (
                    // [TAG] 조건: 체크인-체크아웃 날짜 일치
                    statusItem.attendance_code === 'M100' &&
                    processedCheckInTime <= progressTime &&
                    processedCheckOutTime >= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 100,
                      time: progressTime,
                      statusName: '일치(statusName)-등원',
                      dataName: '일치-등원',
                      statusColor: '#cdcdcd', // 추가
                      hasData: true, // 추가
                    });
                  } else {
                    return (perTimeData = {
                      priority: 101,
                      time: progressTime,
                      statusName: '',
                      hasData: false, // 추가
                    });
                  }
                },
              );

              // [TAG] priorityData: 만약 동일한 시간대에 데이터가 들어온다면(데이터 중복시), sort로 정렬
              const priorityData = perTimeData.sort(
                (a: { priority: number }, b: { priority: number }) => {
                  return a.priority - b.priority;
                },
              );
              oneDayData.push(priorityData[0]);
            });
          }
        } else {
          // [TAG] else: 0에서부터 23시까지 데이터가 아예 없는 경우. 하루 내역이 아예 없는 경우.
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
           * attendance_date[0]가
           * 있으면 -> attendanceDateID 키 값으로 memberItem.attendance_date[0].id를 추가
           * 없으면 -> 아무 것도 추가하지 않음
           */
          ...(memberItem.attendance_date[0] && {
            attendanceDateId: memberItem.attendance_date[0].id,
          }),
          ...(memberItem.attendance_date[0] && {
            date: memberItem.attendance_date[0].date,
          }),
          name: memberItem.name,
          oneDayData: oneDayData,
        };
        processedData.push(result);
      });
    }
  }
  onProcessedData();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        }}
      >
        <div>
          {/* 데이트 피커 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dateValue}
              onChange={newValue => setDateValue(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: TextField }} // 반드시 타입만
              slotProps={{
                textField: {
                  sx: {
                    width: '12rem',
                    backgroundColor: '#f3f3f3',
                    '& .MuiOutlinedInput-root': {
                      height: '45px',
                      '& input': {
                        padding: '0.4rem',
                      },
                    },
                    // 인풋 글씨 (년/월/일)
                    '& .MuiInputBase-input': {
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: 'gray',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '0.4rem',
                      borderColor: '#B2B2B2',
                    },
                  },
                },
                day: {
                  sx: {
                    '&.MuiPickersDay-dayToday': {
                      //selected 상태이면서 today인 경우
                      borderColor: '#fb460d',
                      backgroundColor: '#fb460d',
                      color: 'white',
                    },
                    '&.MuiPickersDay-today': {
                      // 오늘 날짜
                      borderColor: '#fb460d',
                      backgroundColor: '#fb460d',
                      color: 'white',
                    },
                    '&.Mui-selected': {
                      // 선택된 날짜
                      borderColor: '#fc6714',
                      backgroundColor: '#fc6714',
                      color: 'white',
                    },
                  },
                },
                popper: {
                  // 달력 팝업
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: 'white',
                      borderRadius: '0.4rem',
                      padding: '8px',
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>
        <div style={{ marginLeft: '0.4rem' }}>
          <Button handleClick={() => onFetchMemberList()}>
            데이터 불러오기
          </Button>
        </div>
      </div>
      <DailyAttendance
        attendanceData={processedData}
        year={targetYear}
        month={targetMonth}
        date={targetDate}
        onRefresh={onFetchMemberList} // 추가
      />
    </div>
  );
};
