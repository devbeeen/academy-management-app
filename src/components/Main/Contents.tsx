import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export const Contents = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTestData = async () => {
      const { data, error } = await supabase.from('test_table').select('*');
      console.log('data1:', data);
      console.log('error:', error);

      if (error) {
        console.error('Supabase 연동 실패:', error.message);
      } else {
        setData(data);
        console.log('data2:', data);
      }
    };

    fetchTestData();
  }, []);

  return (
    <div>
      Main Page Contents
      {data.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </div>
  );
};
