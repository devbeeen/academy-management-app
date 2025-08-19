import React, { useState, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import { Modal } from '../../lib/UI/Modal/Modal';

export const Contents = () => {
  const [memberList, setMemberList] = useState([]);

  const fetchUserStore = useUserStore(useShallow(state => state));
  const currentCompanyID = fetchUserStore.companyID;

  console.log('fetchUserStore', fetchUserStore);

  useEffect(() => {
    const onFetchMemberList = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('company_id', currentCompanyID);
      setMemberList(data);

      console.log('members 테이블 데이터:', data);

      if (error) {
        console.error('members 테이블 가져오기 실패: ', error);
      }
    };
    onFetchMemberList();
  }, []);

  console.log('memberList', memberList);

  // [TAG] onFetchMemberList(): members 테이블 불러오기(수강생 불러오기)
  /**
   * DB에 조인 요청 -> DB는 내부적으로 JOIN을 수행 -> 결과(중첩된 데이터)를 JSON 형태로 프론트에 돌려줌
   * 기본적으로 조인은 DB에서 이루어지는 쿼리 작업. 아래 코드는 프론트상에서 조인을 요청한 것.
   */
  /*
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
      setMemberList(data);
  
      if (error) {
        console.error('members 테이블 가져오기 실패: ', error);
      }
    };
    */

  const AddMemberModal = memo(({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nameValue, setNameValue] = useState(); // 수강생 이름 값

    console.log('nameValue', nameValue);

    // [TAG] onAddMember(): 수강생 등록
    const onAddMember = async () => {
      const { data, error } = await supabase
        .from('members') // 테이블명
        .insert([
          {
            name: nameValue,
            company_id: currentCompanyID,
          },
        ]);

      if (error) {
        console.error('수강생 등록 실패:', error.message);
      } else {
        console.log('수강생 등록 성공:', data);
      }
    };

    return (
      <>
        {isOpen &&
          ReactDOM.createPortal(
            <Modal onClose={() => setIsOpen(false)}>
              <div style={{ width: '400px', border: 'solid 1px black' }}>
                <div>수강생 등록</div>
                <div>
                  <label>이름</label>
                  <input
                    placeholder="이름을 입력해주세요"
                    style={{ height: '60px', border: 'solid 1px black' }}
                    // onChange={memberNameValue}
                    onChange={e => setNameValue(e.target.value)}
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
                  onClick={() => setIsOpen(false)}
                >
                  닫기
                </button>
              </div>
            </Modal>,
            document.body,
          )}
        <button onClick={() => setIsOpen(true)}>수강생 등록</button>
      </>
    );
  });
  AddMemberModal.displayName = 'AddMemberModal';

  return (
    <div>
      <div>
        <AddMemberModal />
        <button
          style={{ width: '80px', height: '60px', border: 'solid 1px black' }}
          // onClick={() => onFetchMemberList()}
        >
          수강생 불러오기
        </button>
      </div>
      <div>
        {memberList.map((item, idx) => {
          console.log('item: ', item);
          return (
            <div key={idx}>
              <div>{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
