import React, { useState, useEffect, memo, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../supabaseClient';

import * as S from './Contents.style';
import { Modal } from '../../lib/UI/Modal';
import { Button } from '../../lib/UI/Button';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

export const Contents = ({ attendanceData, year, month, date, onRefresh }) => {
  // console.log('attendanceData', attendanceData);

  /**
   * [MEMO] headerHours: 헤더(시), 하루를 시간 단위(1시간 단위)로 나누어 나타냄(0~23시).
   * - 필요한 칸의 개수: 총 24개(0~23시)
   * - 반복문을 이용해 0에서부터~23까지 숫자를 차례로 push하면, 총 24개가 들어감.
   */
  let headerHours = [];
  for (let i = 0; i <= 23; i++) {
    headerHours.push({
      hour: i,
    });
  }
  // const arraysFrom = Array.from({ length: 24 }, () => ({}));

  /**
   * [MEMO] tableHeader: 헤더(분, 10분 단위). 하루를 10분 단위로 나누어 나타냄(시간당 6칸(총 144개)).
   * - 필요한 칸의 개수: 총 144개(하루 24시 x 시간당 6칸)
   * - 그래서 maxMinute 값을 143개로 설정함.
   * - 반복문을 이용해 0에서부터~143까지 숫자를 차례로 push하면, 총 144개가 들어감.
   */
  /**
   * [MEMO] headerMinutes: 헤더(분, 10분 단위). 하루를 10분 단위로 나누어 나타냄(시간당 6칸(총 144개)).
   * - 필요한 칸의 개수: 총 144개(하루 24시 x 시간당 6칸)
   * - 그래서 maxMinutesCount 값을 143개로 설정함.
   * - 반복문을 이용해 0에서부터~143까지 숫자를 차례로 push하면, 총 144개가 들어감.
   */
  let headerMinutes = [];
  const maxMinutesCount = 143;

  for (let i = 0; i <= maxMinutesCount; i++) {
    headerMinutes.push({
      time: i,
    });
  }

  const AttendanceRow = memo(({ data }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [selectedStartHours, setSelectedStartHours] = useState(0);
    const [selectedStartMinutes, setSelectedStartMinutes] = useState(0);
    const [selectedEndHours, setSelectedEndHours] = useState(0);
    const [selectedEndMinutes, setSelectedEndMinutes] = useState(0);

    const startHours = Array.from({ length: 24 }, (_, index) => index); // 시: 0부터 23까지 숫자 배열 생성
    const startMinutes = Array.from({ length: 60 }, (_, index) => index); // 분: 0부터 59까지 숫자 배열 생성
    const endHours = Array.from({ length: 24 }, (_, index) => index);
    const endMinutes = Array.from({ length: 60 }, (_, index) => index);

    // 시작 시간에 대응하는, 종료 시간 드롭박스 배열(시간, 분)
    const availableEndHours = useMemo(() => {
      return endHours.slice(selectedStartHours);
    }, [selectedStartHours]);

    const availableEndMinutes = useMemo(() => {
      const startMin = Number(selectedStartMinutes);

      if (selectedStartHours < selectedEndHours) {
        return endMinutes;
      } else {
        return endMinutes.slice(startMin + 1);
      }
    }, [selectedStartHours, selectedStartMinutes, selectedEndHours]);

    /**
     * 선택값이 availableEndHours 배열 안에
     * 없으면(!연산자 적용했음으로) true -> 유효한 값으로 조정(availableEndHours[0])
     * 있으면 false -> 아무 동작도 하지 않음(기존 선택값 유지)
     */
    useEffect(() => {
      // 종료(시)가 유효하지 않으면 availableEndHours 중, 가장 작은 값으로 업데이트
      if (!availableEndHours.includes(selectedEndHours)) {
        setSelectedEndHours(availableEndHours[0]);
      }
    }, [availableEndHours]);

    useEffect(() => {
      // 종료(분)이 유효하지 않으면 availableEndMinutes 중, 가장 작은 값으로 업데이트
      if (!availableEndMinutes.includes(selectedEndMinutes)) {
        setSelectedEndMinutes(availableEndMinutes[0]);
      }
    }, [availableEndMinutes]);

    // console.log('DailyAttendance-시작(시): ', selectedStartHours);
    // console.log('DailyAttendance-시작(분): ', selectedStartMinutes);
    // console.log('DailyAttendance-종료(시): ', selectedEndHours);
    // console.log('DailyAttendance-종료(분): ', selectedEndMinutes);

    // const oldTime = new Date('2025-07-28T09:30:00+00:00');
    // const oldTime = new Date(yyyy, mm, dd, hour, minute, second');
    const startOldTime = new Date(
      year,
      month,
      date,
      selectedStartHours,
      selectedStartMinutes,
    );

    const endOldTime = new Date(
      year,
      month,
      date,
      selectedEndHours,
      selectedEndMinutes,
    );

    // Supabase 업데이트용 ISO 문자열 변환
    const updatedStartTimeISO = startOldTime.toISOString();
    const updatedEndTimeISO = endOldTime.toISOString();
    // console.log('DailyAttendance-YYYY-MM-DD: ', `${year}-${month}-${date}`);
    // console.log('DailyAttendance-updatedStartTimeISO: ', updatedStartTimeISO);
    // console.log('DailyAttendance-updatedEndTimeISO: ', updatedEndTimeISO);

    const onUpdateTime = async () => {
      // onUpdateTime(): 시작 시간, 종료 시간 수정 + 없으면 새로 스테이터스 추가
      const { data: attendanceDateData, error: attendanceError } =
        await supabase
          .from('attendance_date')
          .upsert(
            {
              member_id: data.id,
              member_name: data.name,
              date: `${year}-${month}-${date}`,
            },
            { onConflict: ['member_id', 'date'] }, // 해당 onConflict가 있어야 '두 개 모두 중복시 업데이트'가 동작함
          )
          .select('id') // <- 이걸 붙여야 id를 돌려받음. upsert만으로는 값을 가져올 수 없기 때문에 select로 가져옴.
          .single(); // upsert 결과가 1행이라고 가정
      if (attendanceError) {
        console.error(
          'attendanceError 에러: ',
          attendanceError || 'no row returned',
        );
      }

      // 2025-07-28T09:30:00+00:00
      const attendanceDateId = attendanceDateData.id;

      const { data: attendanceStatusData, error: attendanceStatusError } =
        await supabase.from('attendance_status').upsert(
          {
            member_name: data.name,
            attendance_date_id: attendanceDateId,
            attendance_code: 'M100',
            date: `${year}-${month}-${date}`,
            check_in_time: updatedStartTimeISO,
            check_out_time: updatedEndTimeISO,
          },
          { onConflict: ['attendance_date_id', 'attendance_code', 'date'] },
        );

      if (attendanceStatusError) {
        console.error('attendanceStatusError 에러: ', attendanceStatusError);
      }
      alert('데이터가 업데이트되었습니다.');
      onRefresh(); // 추가
    };

    return (
      <div>
        {isOpen &&
          ReactDOM.createPortal(
            <Modal onClose={() => setIsOpen(false)}>
              <div style={{ marginBottom: '1rem', color: '#fc6714' }}>
                상태: 수업
              </div>
              {/* */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  시작 시간
                  <div style={{ marginLeft: '1rem' }}>
                    <select
                      id="start-time-hour"
                      value={selectedStartHours}
                      onChange={e => setSelectedStartHours(e.target.value)}
                    >
                      {startHours.map(hour => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="start-time-hour">시</label>
                  </div>
                  <div style={{ marginLeft: '0.5rem' }}>
                    <select
                      id="start-time-minute"
                      value={selectedStartMinutes}
                      onChange={e => setSelectedStartMinutes(e.target.value)}
                    >
                      {startMinutes.map(minute => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="start-time-minute">분</label>
                  </div>
                </div>
                {/* */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  종료 시간
                  <div style={{ marginLeft: '1rem' }}>
                    <select
                      id="end-time-hour"
                      value={selectedEndHours}
                      onChange={e => setSelectedEndHours(e.target.value)}
                    >
                      {availableEndHours.map(hour => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="end-time-hour">시</label>
                  </div>
                  <div style={{ marginLeft: '0.5rem' }}>
                    <select
                      id="end-time-minute"
                      value={selectedEndMinutes}
                      onChange={e => setSelectedEndMinutes(e.target.value)}
                    >
                      {availableEndMinutes.map(minute => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="end-time-minute">분</label>
                  </div>
                </div>
              </div>
              {/* */}
              <S.ButtonsWrap>
                <Button handleClick={onUpdateTime} width={'4rem'}>
                  확인
                </Button>
                <div style={{ marginLeft: '0.5rem' }}>
                  <Button handleClick={() => setIsOpen(false)} width={'4rem'}>
                    닫기
                  </Button>
                </div>
              </S.ButtonsWrap>
            </Modal>,
            document.body,
          )}
        {/* 수정 버튼 */}
        <Button handleClick={() => setIsOpen(true)} fontSize={'1rem'}>
          <EditRoundedIcon fontSize="inherit" />
        </Button>
      </div>
    );
  });
  AttendanceRow.displayName = 'AttendanceRow';

  const AttendanceRowDelete = memo(({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const attendanceDateId = data.attendanceDateId;

    const deleteAttendance = async () => {
      const { data, error } = await supabase
        .from('attendance_status')
        .delete()
        .eq('attendance_date_id', attendanceDateId) // 삭제할 행의 조건(attendance_date테이블의 id 일치 = 날짜 id 일치)
        .select();

      // console.log('attendanceDateId: ', attendanceDateId);
      // console.log('deleteAttendance테이블-data: ', data);

      if (error) {
        console.error('attendance_status 삭제 실패:', error);
      } else {
        alert('데이터가 성공적으로 삭제되었습니다.');
        setIsOpen(false);
        onRefresh(); // 추가
      }
    };

    return (
      <>
        {isOpen &&
          ReactDOM.createPortal(
            <Modal onClose={() => setIsOpen(false)}>
              <div>
                정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
              </div>
              <S.ButtonsWrap>
                <Button handleClick={deleteAttendance} width={'4rem'}>
                  확인
                </Button>
                <p style={{ marginLeft: '0.5rem' }}>
                  <Button handleClick={() => setIsOpen(false)} width={'4rem'}>
                    닫기
                  </Button>
                </p>
              </S.ButtonsWrap>
            </Modal>,
            document.body,
          )}
        {/* 삭제 버튼 */}
        <Button handleClick={() => setIsOpen(true)} fontSize={'1rem'}>
          <DeleteRoundedIcon fontSize="inherit" />
        </Button>
      </>
    );
  });

  AttendanceRowDelete.displayName = 'AttendanceRowDelete';

  return (
    <>
      <div
        // TableWrap
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <table
          // Tables
          style={{
            backgroundColor: 'white',
            width: '100%',
            tableLayout: 'fixed',
            fontSize: '0.8rem',
          }}
        >
          <thead
          // THead / Table
          >
            <tr
              // TrForHeader / TrHeader
              style={{
                display: 'tableCell',
                verticalAlign: 'middle',
                textAlign: 'start',
                paddingLeft: '5px',
                width: '50px',
                height: '50px' /* 변경 전: '60px' */,
                color: 'solid 1px #cdcdcd',
                fontWeight: '400',
              }}
            >
              <th
                // ThEmployeeNameHeader / ThFirstHeader
                style={{
                  position: 'sticky' /* sticky 적용을 위한 코드 */,
                  left: '0' /* sticky 적용을 위한 코드 */,
                  width: '170px' /* 이름 너비 */,
                  borderBottom: 'solid 1px #cdcdcd',
                  backgroundColor: 'white' /* sticky 적용을 위한 코드 */,
                  color: 'black',
                }}
              >
                {/* 수강생 목록 영역 헤더 */}
                {/* (수강생 목록) */}
              </th>

              <th
                // ThTotalWorkingTimeHeader / ThSecondHeader
                style={{
                  position: 'sticky' /* sticky 적용을 위한 코드 */,
                  left: '170px' /* sticky 적용을 위한 코드 */,
                  width: '80px' /* 수정/삭제 너비 */,
                  borderBottom: 'solid 1px #cdcdcd',
                  backgroundColor: 'white' /* sticky 적용을 위한 코드 */,
                  color: 'black',
                }}
              >
                {/* 수정/삭제 영역 헤더 */}
                {/* (수정/삭제) */}
              </th>

              {/* 0~23시 헤더 */}
              {headerHours.map((data, idx) => {
                return (
                  <th
                    // ThHourHeader / ThThirdHeader
                    key={idx}
                    colSpan={6}
                    style={{
                      display: 'tableCell' /* 테이블 셀 중앙정렬 */,
                      verticalAlign: 'middle' /* 테이블 셀 중앙정렬 */,
                      textAlign: 'start',
                      paddingLeft: '5px',
                      width: '50px' /* 시간 헤더(0~23) 너비 */,
                      /*  height: '50px', -> 변경 전: '60px' */
                      borderBottom: 'solid 1px #cdcdcd',
                      // borderRight: idx === 23 ? 'none' : 'solid 3px orange',
                      borderRight:
                        idx === headerHours.length - 1
                          ? 'none'
                          : 'solid 1px #cdcdcd',
                      color: 'black',
                      fontWeight: '400',
                      fontSize: '0.4rem',
                    }}
                  >
                    {data.hour}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* 아래 tbody:
            - '분' 단위 셀을 화면에 적용하고자 넣은 것. ThHourHeader 셀 하나당 = '10분' 단위.
            - ThHourHeader 하나당(=시간당) ThTimeHeader 6개의 셀이 들어간다. 이를 위해 ThHourHeader에 colSpan={6}을 적용한 것.
          */}

          <tbody
            // THead
            style={{
              backgroundColor: 'white',
            }}
          >
            <tr>
              <th
                // ThEmployeeNameHeader / ThNameHeader
                style={{
                  position: 'sticky' /* sticky 적용을 위한 코드 */,
                  left: '0' /* sticky 적용을 위한 코드 */,
                  width: '170px' /* [MEMO] 이름 너비 */,
                  backgroundColor: 'red' /* sticky 적용을 위한 코드 */,
                  color: 'black',
                }}
              />
              <th
                // ThTotalWorkingTimeHeader / ThInfoHeader
                style={{
                  position: 'sticky' /* sticky 적용을 위한 코드 */,
                  width: '80px' /* [MEMO] 총 근무시간 너비 */,
                  left: '170px' /* sticky 적용을 위한 코드, ThEmployeeNameHeader의 너비가 170px */,
                  backgroundColor: 'pink' /* sticky 적용을 위한 코드 */,
                }}
              />
              {headerMinutes.map((data, idx) => (
                <th
                  // ThTimeHeader
                  key={idx}
                />
              ))}
            </tr>
          </tbody>

          <tbody>
            {attendanceData.map((data, idx) => {
              return (
                <tr
                  key={idx}
                  // TrForBody
                  style={{
                    height:
                      '50px' /* 바디에 있는 td(바디에 있는 셀들) 높이 -> 변경 전: '60px' */,
                    backgroundColor: 'white',
                  }}
                >
                  {/* 멤버 목록 영역 본문 */}
                  <td
                    // TdEmployeeName
                    style={{
                      position: 'sticky' /* sticky 적용을 위한 코드 */,
                      display: 'tableCell' /* 테이블 셀 중앙정렬 */,
                      verticalAlign: 'middle' /* 테이블 셀 중앙정렬 */,
                      textAlign:
                        'start' /* text-align: center; */ /* 테이블 셀 중앙정렬 */,
                      left: '0' /* sticky 적용을 위한 코드 */,
                      paddingLeft: '30px',
                      borderBottom: 'solid 1px #cdcdcd',
                      backgroundColor: 'white' /* sticky 적용을 위한 코드 */,
                      /* sticky 적용을 위한 코드, z-index 값을 주어야 스크롤을 움직일 때 상태바 위에 나타날 수 있음 */
                      color: 'black',
                      fontWeight: '500',
                      zIndex: '1',
                    }}
                  >
                    {data.name}
                  </td>

                  {/* 수정/삭제 영역 본문 */}
                  <td
                    //TdTotalWorkingTime
                    style={{
                      position: 'sticky' /* sticky 적용을 위한 코드 */,
                      display: 'tableCell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      left: '170px' /* sticky 적용을 위한 코드, TdEmployeeName의 너비가 170px */,
                      // border-bottom: solid 1px ${({ theme }) => theme.backgroundColor.shadowGray};
                      borderBottom: 'solid 1px #cdcdcd',
                      /* sticky 적용을 위한 코드 - border-right 주석 처리:
                       * sticky 적용을 위해 주석처리 함.
                       * sticky 미적용을 원할 경우, div 요소 내 border-right를 지운 후, 이곳에 border-right를 활성화 시키면 됨
                       */
                      // color: 'white', // 주석
                      backgroundColor: '#f3f3f3' /* sticky 적용을 위한 코드 */,
                      fontWeight: '500',
                      /* sticky 적용을 위한 코드, z-index 값을 주어야 스크롤을 움직일 때 상태바 위에 나타날 수 있음 */
                      zIndex: '1',
                    }}
                  >
                    {/* 수정 및 삭제 버튼/모달 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <AttendanceRow data={data} />
                      </div>
                      <div style={{ marginLeft: '0.1rem' }}>
                        <AttendanceRowDelete data={data} />
                      </div>
                    </div>
                  </td>

                  {/* 데이터 UI 영역 (상태바 영역) */}
                  {data.oneDayData.map((data, idx) => (
                    <td
                      // TdTimeInfo
                      key={idx}
                      style={{
                        borderBottom: 'solid 1px #cdcdcd',
                      }}
                    >
                      <div
                        // StatusBarSection
                        style={{
                          display: 'flex' /* [MEMO] 색상바 중앙정렬 */,
                          flexDirection: 'column' /* [MEMO] 색상바 중앙정렬 */,
                          justifyContent: 'center' /* [MEMO] 색상바 중앙정렬 */,
                          width: '100%',
                          height:
                            '50px' /* 색상바를 포함하고 있는 셀 높이 -> 변경 전: '60px' */,
                        }}
                      >
                        <div
                          // StatusBarWrap
                          style={{
                            position: 'relative',
                            width: '100%',
                          }}
                        >
                          <div
                            // StatusBarWrap에 속한 첫번째 안쪽 div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height:
                                '30px' /* [MEMO] 색상바 높이 -> 변경 전: '320px' */,
                              backgroundColor: data?.statusColor ?? '',
                            }}
                          >
                            <div
                              // StatusBarWrap에 속한 가장 안쪽 div
                              style={{
                                position: 'relative',
                                width: '100%',
                                height:
                                  '30px' /* [MEMO] 색상바 높이 -> 변경 전: '320px'  */,

                                /* [MEMO] 색상바 상태 텍스트 스타일 ->  아래부터가 가장 안쪽 div스타일 적용*/
                                display: 'tableCell',
                                verticalAlign: 'middle',
                                textAlign: 'start',
                                paddingLeft: '5px', // [MEMO] 상태바 텍스트 왼쪽 여백
                              }}
                            >
                              {/* 각 상태에 따른, 상태바 부분 */}
                              {data?.dataName === '등원' ? <div /> : <div />}
                            </div>
                          </div>
                        </div>

                        {/* 아래 p태그: 상태바 호버시 나타나는 작은 말풍선 */}
                        <p />
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
