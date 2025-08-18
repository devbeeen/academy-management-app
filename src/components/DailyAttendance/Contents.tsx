import React, { useState, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';

import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Modal } from '../../lib/UI/Modal/Modal';

export const Contents = ({ attendanceData, year, month, date }) => {
  let headerHours = [];
  for (let i = 0; i <= 23; i++) {
    headerHours.push({
      hour: i,
    });
  }

  let headerMinutes = [];
  const maxMinutesCount = 143;

  for (let i = 0; i <= maxMinutesCount; i++) {
    headerMinutes.push({
      time: i,
    });
  }

  const AttendanceRow = memo(({ data }) => {
    const [isUpdateTimeOpen, setIsUpdateTimeOpen] = useState(false);

    const oldTime = new Date(`${year}-${month}-${date}`);

    oldTime.setHours(10); // 시
    oldTime.setMinutes(22); // 분

    const updatedTimeISO = oldTime.toISOString();

    console.log('🍞🍞🍞🍞date🍞', date);
    const onUpdateTime = async () => {
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
      const attendanceId = attendanceDateData.id;

      const { data: attendanceStatusData, error: attendanceStatusError } =
        await supabase.from('attendance_status').upsert(
          {
            member_name: data.name,
            attendance_id: attendanceId,
            attendance_code: 'M100',
            date: `${year}-${month}-${date}`,
            check_in_time: updatedTimeISO,
            // check_out_time: '',
          },
          { onConflict: ['attendance_id', 'attendance_code', 'date'] },
        );

      if (attendanceStatusError) {
        console.error('attendanceStatusError 에러: ', attendanceStatusError);
      }
    };

    return (
      <>
        <div>
          {isUpdateTimeOpen &&
            ReactDOM.createPortal(
              <Modal onClose={() => setIsUpdateTimeOpen(false)}>
                시작시간 종료시간 수정하는 모달 + 없으면 새로 스테이터스 추가함
                <div style={{ color: 'green' }}>상태: 등원(M100)</div>
                <div>
                  <div>
                    <label>시작시간(시)</label>
                    <input
                      placeholder="시작시간(시)"
                      style={{ height: '60px', border: 'solid 1px black' }}
                      onChange={e => setStartValueHour(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>시작시간(분)</label>
                    <input
                      placeholder="시작시간(분)"
                      style={{ height: '60px', border: 'solid 1px black' }}
                      onChange={e => setStartValueMinute(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <button
                    label="확인"
                    onClick={onUpdateTime}
                    style={{
                      width: '80px',
                      height: '60px',
                      border: 'solid 1px black',
                    }}
                  >
                    확인
                  </button>
                  <button
                    label="닫기"
                    onClick={() => setIsUpdateTimeOpen(false)}
                    style={{
                      width: '80px',
                      height: '60px',
                      border: 'solid 1px black',
                    }}
                  >
                    닫기
                  </button>
                </div>
              </Modal>,
              document.body,
            )}
          <button onClick={() => setIsUpdateTimeOpen(true)}>수정</button>
        </div>
      </>
    );
  });
  AttendanceRow.displayName = 'AttendanceRow';

  return (
    <>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        데일리 페이지
        <table
          style={{
            backgroundColor: 'white',
            width: '100%',
            tableLayout: 'fixed',
            fontSize: '13px',
          }}
        >
          <thead
            style={{
              backgroundColor: 'white',
            }}
          >
            <tr
              style={{
                display: 'tableCell',
                verticalAlign: 'middle',
                textAlign: 'start',
                width: '50px',
                height: '60px',
                paddingLeft: '5px',
                borderBottom: 'solid 3px green',
                borderLeft: 'solid 3px olive',
                color: 'solid 1px gray',
                fontWeight: '400',
              }}
            >
              <th
                style={{
                  width: '170px',
                  color: 'black',
                  position: 'sticky',
                  left: '0',
                  backgroundColor: 'white',
                }}
              >
                (멤버 영역)
              </th>

              <th
                style={{
                  width: '80px',
                  color: 'black',
                  position: 'sticky',
                  left: '170px',
                  backgroundColor: 'white',
                  borderBottom: 'solid 3px red',
                }}
              >
                (버튼 영역)
              </th>

              {headerHours.map((data, idx) => {
                return (
                  <th
                    key={idx}
                    colSpan={6}
                    style={{
                      display: 'tableCell',
                      verticalAlign: 'middle',
                      textAlign: 'start',
                      width: '50px',
                      height: '60px',
                      paddingLeft: '5px',
                      borderBottom: 'solid 3px orange',
                      borderRight:
                        idx === headerHours.length - 1
                          ? 'none'
                          : 'solid 3px orange',
                      fontWeight: '400',
                    }}
                  >
                    {data.hour}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody
            style={{
              backgroundColor: 'white',
            }}
          >
            <tr>
              <th
                style={{
                  width: '170px',
                  color: 'black',
                  position: 'sticky',
                  left: '0',
                  backgroundColor: 'yellowgreen',
                }}
              />
              <th
                style={{
                  width: '80px',
                  position: 'sticky',
                  left: '170px',
                  backgroundColor: 'pink',
                }}
              />
              {headerMinutes.map((data, idx) => (
                <th
                  key={idx}
                  style={{
                    backgroundColor: 'yellow',
                  }}
                />
              ))}
            </tr>
          </tbody>

          <tbody>
            {attendanceData.map((data, idx) => {
              console.log('data: ', data);
              return (
                <tr
                  key={idx}
                  style={{
                    height: '60px',
                    backgroundColor: 'yellow',
                  }}
                >
                  {/* 멤버들 */}
                  <td
                    style={{
                      display: 'tableCell',
                      verticalAlign: 'middle',
                      textAlign: 'start',
                      paddingLeft: '30px',
                      borderBottom: 'solid 1px blue',
                      color: 'black',
                      fontWeight: '500',
                      position: 'sticky',
                      left: '0',
                      backgroundColor: 'orange',
                      zIndex: '1',
                    }}
                  >
                    {data.name}
                  </td>

                  {/* 버튼 영역 */}
                  <td
                    style={{
                      display: 'tableCell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      borderBottom: 'solid 3px red',
                      fontWeight: '500',
                      position: 'sticky',
                      left: '170px',
                      backgroundColor: 'skyblue',
                      zIndex: '1',
                    }}
                  >
                    {/* 수정 버튼 */}
                    <AttendanceRow data={data} />
                  </td>

                  {/* 데이터 있는(상태바 있는) 영역 */}
                  {data.oneDayData.map((data, idx) => (
                    <td
                      key={idx}
                      style={{
                        borderBottom: 'solid 3px purple',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '32px',
                              fontSize: '12px',
                              fontWeight: '400',
                              color: 'olive',
                              backgroundColor: data?.statusColor ?? '',
                            }}
                          >
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: '32px',
                                fontSize: '12px',
                                fontWeight: '400',
                                color: 'olive',
                                display: 'tableCell',
                                verticalAlign: 'middle',
                                textAlign: 'start',
                                paddingLeft: '5px',
                              }}
                            >
                              {data?.dataName === '등원' ? <div /> : <div />}
                            </div>
                          </div>
                        </div>

                        {/* 상태바 호버시 말풍선 -> 아래 p태그 */}
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
