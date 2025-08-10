import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

export const Contents = ({ attendanceData }) => {
  console.log('attendanceData', attendanceData);

  // const pullData = useUserStore(
  //   useShallow(state => ({
  //     name: state.id,
  //   })),
  // );
  const pullData = useUserStore(useShallow(state => state));

  console.log('pullData', pullData);

  /**
   * [MEMO] headerMinutesArray: 헤더(분, 10분 단위). 하루를 10분 단위로 나누어 나타냄(시간당 6칸(총 144개)).
   * - 필요한 칸의 개수: 총 144개(하루 24시 x 시간당 6칸)
   * - 그래서 maxMinutesCount 값을 143개로 설정함.
   * - 반복문을 이용해 0에서부터~143까지 숫자를 차례로 push하면, 총 144개가 들어감.
   */
  let headerMinutesArray = [];
  const maxMinutesCount = 143;

  for (let i = 0; i <= maxMinutesCount; i++) {
    headerMinutesArray.push({
      time: i,
    });
  }

  let processedEmployeeData = [];
  function getAttendanceData() {
    processedEmployeeData = [];

    attendanceData.forEach(item => {
      console.log('item: ', item);

      let employeeDayArray = [];
      let totalWorkingTime = 0; // [MEMO] 총 근무 시간
      let expectedStartScheduleTime = ''; // [MEMO] 예상 출근 시간
      let expectedEndScheduleTime = ''; // [MEMO] 예상 퇴근 시간
    });

    if (attendanceData.date) {
      /**
       * [MEMO] processTime: 하루 총 시간
       * 1시간당 10분 단위로 나타내기로 했으므로 -> (하루(24시) x 시간당 6칸 = 총 144개)
       */

      for (let processTime = 0; processTime <= maxMinutesCount; processTime++) {
        //
      }
    }
  }
  getAttendanceData();

  return <div>이얍</div>;
};
