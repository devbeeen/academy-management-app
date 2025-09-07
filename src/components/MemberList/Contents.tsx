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

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

export const Contents = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(); // 행 수정/삭제 관련
  const [isEditOpen, setIsEditOpen] = useState(false); // 삭제 관련
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 삭제 관련

  const fetchUserStore = useUserStore(useShallow(state => state));
  const currentCompanyID = fetchUserStore.companyID;

  /*
  // 수정/추가 및 삭제 기능 성공시,
  // 자동으로 onFetchMemberList()(데이터 불러오기)를 실행시키고자
  // (=onFetchMemberList()를 별도로 활용하고자)
  // useEffect에서 별도로 뺌
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
    id: idx, // MUI의 Data Grid에는 id 속성이 필수로 요구됨
    name: member.name,
    memberId: member.id,
    phoneNumber: member.phone_number,
  }));

  const columns = [
    {
      field: 'delete', // 가상 필드 이름
      headerName: '', // 컬럼 헤더 이름
      // width: 80,
      // align: 'center',
      // headerAlign: 'center', // 헤더 텍스트 정렬
      // filterable: false,
      disableColumnMenu: true,
      renderCell: (
        params, // params에는 해당 행의 데이터가 들어있음
      ) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%', // 셀 전체 넓이 사용
            height: '100%', // 셀 높이 전체 사용
            boxSizing: 'border-box', // height 100% 정확히 맞춤
          }}
        >
          {/* ----- */}
          <Button handleClick={() => handleEdit(params.row)} fontSize={'1rem'}>
            <EditRoundedIcon fontSize="inherit" />
          </Button>
          {/* ----- */}

          <div style={{ marginLeft: '0.1rem' }}>
            <Button
              handleClick={() => handleDelete(params.row)}
              fontSize={'1rem'}
            >
              <DeleteRoundedIcon fontSize="inherit" />
            </Button>
          </div>
        </div>
      ),
    },
    { field: 'id', headerName: '순서', width: 80 },
    { field: 'name', headerName: '이름', width: 140 },
    { field: 'phoneNumber', headerName: '연락처', width: 140 },
  ];

  const handleEdit = row => {
    // console.log('row 데이터: ', row);
    setSelectedRow(row);
    setIsEditOpen(true);
  };

  const handleDelete = row => {
    // console.log('row 데이터: ', row);
    setSelectedRow(row);
    setIsDeleteOpen(true);
  };

  const onDeleteMember = async () => {
    if (!selectedRow) return;

    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('id', selectedRow.memberId) // 삭제할 행의 조건(member id 일치)
      .select(); // select()를 붙여 데이터 바로 가져오기 (그래야 리스트 갱신시 데이터가 삭제된 것이 바로 반영되기에)

    if (error) {
      console.error('members 삭제 실패:', error);
    } else {
      alert('데이터가 성공적으로 삭제되었습니다.');
      setIsDeleteOpen(false);
      onFetchMemberList(); // ✅ 리스트 갱신
    }
  };

  const EditModal = memo(() => {
    const [memberName, setMemberName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // [TAG] onEditMember(): 수강생 정보 수정
    const onEditMember = async () => {
      if (!selectedRow) return;

      const { data, error } = await supabase
        .from('members')
        .update({
          name: memberName || selectedRow.name,
          phone_number: phoneNumber || selectedRow.phoneNumber,
          /**
           * memberName || selectedRow.name:
           * memberName이 falsy에 해당 되면, selectedRow.name을 사용.
           * memberName에 값이 있으면, memberName를 사용.
           */
        })
        .eq('id', selectedRow.memberId)
        .select();

      if (error) {
        console.error('members 수정 실패:', error);
      } else {
        alert('데이터가 성공적으로 수정되었습니다.');
        setIsEditOpen(false);
        onFetchMemberList(); // ✅ 리스트 갱신
      }
    };

    return (
      <>
        {isEditOpen && (
          <Modal onClose={() => setIsEditOpen(false)}>
            <ModalElementsWrap>
              <div>수정!</div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>이름</div>
                <input
                  placeholder="이름"
                  onChange={e => setMemberName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>연락처</div>
                <input
                  placeholder="연락처"
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>

              <ButtonsWrap>
                <Button handleClick={onEditMember} width={'4rem'}>
                  확인
                </Button>
                <div style={{ marginLeft: '0.5rem' }}>
                  <Button
                    handleClick={() => setIsEditOpen(false)}
                    width={'4rem'}
                  >
                    닫기
                  </Button>
                </div>
              </ButtonsWrap>
            </ModalElementsWrap>
          </Modal>
        )}
      </>
    );
  });
  EditModal.displayName = 'EditModal';
  /**
   * EditModal.displayName = 'EditModal';:
   * Component definition is missing display nameeslintreact/display-name 에러.
   * ESLint의 react/display-name 규칙에 걸린 것.
   * 컴포넌트에 이름이 없다고 여겨져서 생긴 에러로, 해결을 위해 명시적으로 displayName을 설정했다.
   */

  const AddMemberModal = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [nameValue, setNameValue] = useState(); // 수강생 이름 값

    // [TAG] onAddMember(): 수강생 등록
    const onAddMember = async () => {
      if (!nameValue) return alert('정보를 입력해 주세요.');

      const { data, error } = await supabase.from('members').insert([
        {
          name: nameValue,
          company_id: currentCompanyID,
        },
      ]);

      if (error) {
        console.error('수강생 등록 실패:', error.message);
      } else {
        // console.log('수강생 등록 성공:', data);
        alert('성공적으로 등록되었습니다.');
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

        <EditModal />

        {isDeleteOpen && (
          <Modal onClose={() => setIsDeleteOpen(false)}>
            <ModalElementsWrap>
              <div>
                정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
              </div>
              <ButtonsWrap>
                <Button handleClick={onDeleteMember} width={'4rem'}>
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
