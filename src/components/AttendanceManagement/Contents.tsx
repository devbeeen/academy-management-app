import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const Contents = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    //
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

  console.log('attendanceData: ', attendanceData);

  return <div>근태/출결 관리</div>;
};
