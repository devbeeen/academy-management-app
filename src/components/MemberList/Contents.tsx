import React, { useState, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';

import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

import styled from 'styled-components';
import { Modal } from '../../lib/UI/Modal';
import { Button } from '../../lib/UI/Button';

import { DataGrid } from '@mui/x-data-grid'; // MUI 그리드
import Paper from '@mui/material/Paper'; // MUI 그리드
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

export const Contents = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(); // 삭제 관련
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 삭제 관련

  const fetchUserStore = useUserStore(useShallow(state => state));
  const currentCompanyID = fetchUserStore.companyID;

  /*
  // 수정/추가 및 삭제 기능 성공시 onFetchMemberList()를 실행시키고자 useEffect에서 별도로 뺌
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
  */

  useEffect(() => {
    onFetchMemberList();
  }, []);

  const onFetchMemberList = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('company_id', currentCompanyID);
    setMemberList(data);

    // console.log('members 테이블 데이터:', data);

    if (error) {
      console.error('members 테이블 가져오기 실패: ', error);
    }
  };

  // console.log('MemberList-memberList', memberList);

  const rows = memberList.map((member, idx) => ({
    id: idx,
    name: member.name,
    memberId: member.id,
  }));

  const columns = [
    {
      field: 'delete', // 가상 필드 이름
      headerName: '', // 컬럼 헤더 이름
      width: 60,
      align: 'center',
      // headerAlign: 'center', // 헤더 텍스트 정렬
      // filterable: false,
      disableColumnMenu: true,
      renderCell: (
        params, // params에는 해당 행 데이터가 들어있음
      ) => (
        <button
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%', // 셀 전체 넓이 사용
            height: '100%', // 셀 높이 전체 사용
            boxSizing: 'border-box', // height 100% 정확히 맞춤
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
          onClick={() => handleDelete(params.row)}
        >
          <DeleteRoundedIcon fontSize="inherit" />
        </button>
      ),
    },
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: '이름', width: 140 },
  ];

  const handleDelete = row => {
    // console.log('params: ', row);
    setSelectedRow(row);
    setIsDeleteOpen(true);
  };

  const deleteMember = async () => {
    if (!selectedRow) return;

    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('id', selectedRow.memberId) // 삭제할 행의 조건(member id 일치)
      .select();

    if (error) {
      console.error('members 삭제 실패:', error);
    } else {
      alert('데이터가 성공적으로 삭제되었습니다.');
      setIsDeleteOpen(false);
      onFetchMemberList(); // ✅ 리스트 갱신
    }
  };

  const AddMemberModal = memo(({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nameValue, setNameValue] = useState(); // 수강생 이름 값

    // [TAG] onAddMember(): 수강생 등록
    const onAddMember = async () => {
      const { data, error } = await supabase.from('members').insert([
        {
          name: nameValue,
          company_id: currentCompanyID,
        },
      ]);

      if (error) {
        console.error('수강생 등록 실패:', error.message);
      } else {
        console.log('수강생 등록 성공:', data);
        onFetchMemberList(); // ✅ 리스트 갱신
      }
    };

    return (
      <>
        {isOpen &&
          ReactDOM.createPortal(
            <Modal onClose={() => setIsOpen(false)}>
              <ModalElementsWrap>
                <div style={{ color: '#fc6714' }}>신규 학생 등록</div>
                <ItemWrap>
                  <ItemName>이름</ItemName>
                  <ItemInput
                    placeholder="이름을 입력해주세요"
                    onChange={e => setNameValue(e.target.value)}
                  />
                </ItemWrap>
                <ButtonsWrap>
                  <Button handleClick={() => onAddMember()} width={'4rem'}>
                    등록
                  </Button>
                  <div style={{ marginLeft: '0.5rem' }}>
                    <Button handleClick={() => setIsOpen(false)} width={'4rem'}>
                      닫기
                    </Button>
                  </div>
                </ButtonsWrap>
              </ModalElementsWrap>
            </Modal>,
            document.body,
          )}
        <Button handleClick={() => setIsOpen(true)}>신규 학생 등록</Button>
      </>
    );
  });
  AddMemberModal.displayName = 'AddMemberModal';

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <AddMemberModal />
        {/* <Button handleClick={() => onFetchMemberList()}>수강생 불러오기</Button> */}
      </div>
      <div>
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 50, 100]}
            sx={{ border: 0 }}
          />
        </Paper>
        {isDeleteOpen && (
          <Modal onClose={() => setIsDeleteOpen(false)}>
            <ModalElementsWrap>
              <div>
                정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
              </div>
              <ButtonsWrap>
                <Button handleClick={deleteMember} width={'4rem'}>
                  삭제
                </Button>
                <div style={{ marginLeft: '0.5rem' }}>
                  <Button
                    handleClick={() => setIsDeleteOpen(false)}
                    width={'4rem'}
                  >
                    닫기
                  </Button>
                </div>
              </ButtonsWrap>
            </ModalElementsWrap>
          </Modal>
        )}
      </div>
    </div>
  );
};

export const ModalElementsWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* width: 18rem; */
`;

const ItemWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;

  &.last-item {
    margin-bottom: 2rem;
  }
`;

const ItemName = styled.div`
  width: 2rem;
`;

const ItemInput = styled.input`
  padding-left: 0.4rem;
  width: 12rem;
  height: 2.5rem;
  border: solid 1px ${({ theme }) => theme.color.gray};
  border-radius: 0.4rem;
  background-color: ${({ theme }) => theme.color.lightGrayLevel1};
  font-size: 0.8rem;

  &::placeholder {
    /* 플레이스홀더 스타일 */
    color: ${({ theme }) => theme.color.gray};
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.8;
  }
`;

const ButtonsWrap = styled.div`
  display: flex;
  margin-top: 1rem;
`;
