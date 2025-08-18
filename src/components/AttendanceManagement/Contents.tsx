// 수강생 등록 컴포넌트

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Contents as DailyAttendance } from '../DailyAttendance/Contents';

import { Modal } from '../../lib/UI/Modal/Modal';
import { toKST } from '../../lib/utils/toKST';

import { DayPicker } from 'react-day-picker'; // 💐

export const Contents = () => {
  const [memberName, setMemberName] = useState(); // 수강생 이름(등록을 위한)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false); // 수강생 등록 모달
  const [isOpen, setIsOpen] = useState(false); // 출결시간 등록 모달

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [selected, setSelected] = useState<Date>(); // 💐
  const [month, setMonth] = useState(new Date()); // 💐
  const ref = useRef<HTMLDivElement>(null); // 💐
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); //

  const fetchUserStore = useUserStore(useShallow(state => state));
  console.log('fetchUserStore', fetchUserStore);

  const currentCompanyID = fetchUserStore.companyID;

  const memberNameValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberName(e.target.value);
  };

  // 수강생 등록 함수
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

  // 수강생 불러오기
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
      .eq('company_id', currentCompanyID)
      .eq('attendance.date', '2025-07-28');
    setMemberList(data);

    console.log('members 테이블 데이터:', data);

    if (error) {
      console.error('members 테이블 가져오기 실패: ', error);
    }
  };

  const tableHeader: {
    time: number;
  }[] = [];
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
              // console.log('attendanceItem: ', attendanceItem);

              let perTimeData = attendanceItem.attendance_status.map(
                statusItem => {
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
                    statusItem.attendance_code === 'M100' &&
                    Number(statusItem.check_in_time.slice(8, 10)) !==
                      Number(statusItem.check_out_time.slice(8, 10)) &&
                    processedCheckInTime <= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 98,
                      time: progressTime,
                      statusName: '불일치statusName-체크인',
                      dataName: '체크인',
                      statusColor: 'olive',
                      hasData: true,
                    });
                  } else if (
                    statusItem.attendance_code === 'M100' &&
                    processedCheckInTime <= progressTime &&
                    processedCheckOutTime >= progressTime
                  ) {
                    return (perTimeData = {
                      priority: 100,
                      time: progressTime,
                      statusName: '일치statusName-체크인',
                      dataName: '체크인',
                      statusColor: 'olive',
                      hasData: true,
                    });
                  } else {
                    // 뉴)
                    return (perTimeData = {
                      priority: 101,
                      time: progressTime,
                      statusName: '',
                      hasData: false,
                    });
                  }
                },
              );

              const priorityData = perTimeData.sort(
                (a: { priority: number }, b: { priority: number }) => {
                  return a.priority - b.priority;
                },
              );
              oneDayData.push(priorityData[0]);
            });
          }
        } else {
          for (let processTime = 0; processTime <= maxMinute; processTime++) {
            const result = {
              time: processTime,
              statusName: 'statusName-기록없음',
            };

            oneDayData.push(result);
          }
        }

        const result = {
          id: memberItem.id,
          name: memberItem.name,
          oneDayData: oneDayData,
        };
        processedData.push(result);
      });
    }
  }
  onProcessedData();

  console.log('processedData: ', processedData);

  return (
    <div
      style={{
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      출결 관리
      <div
        style={{
          display: 'flex',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            readOnly
            placeholder="날짜 선택"
            value={selectedDate ? selectedDate.toLocaleDateString() : ''}
            onClick={() => setIsCalendarOpen(!isOpen)}
            style={{ padding: '6px 10px', width: '150px' }}
          />
          {isCalendarOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                backgroundColor: 'white',
              }}
            >
              <DayPicker
                key={month.toISOString()}
                animate
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selected}
                onSelect={setSelected}
                footer={
                  selected
                    ? `Selected: ${selected.toLocaleDateString()}`
                    : 'Pick a day.'
                }
              />
            </div>
          )}
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
      <DailyAttendance attendanceData={processedData} />
    </div>
  );
};
