import styled from 'styled-components';

interface ThThirdHeaderProps {
  isLast?: boolean;
}

export const Table = styled.table`
  background-color: white;
  width: 100%;
  table-layout: fixed;
  font-size: 0.8rem;
`;

// export const Thead = styled.thead`
//   /* background-color: 'white'; */
// `;

export const TrHeader = styled.tr`
  display: tableCell;
  vertical-align: middle;
  text-align: start;
  padding-left: 5px;
  width: 50px;
  height: 50px; /* 변경 전: 60px */
  color: 'gray';
  font-weight: '400';
`;

export const ThFirstHeader = styled.th`
  position: sticky; /* sticky 적용을 위한 코드 */
  left: 0; /* sticky 적용을 위한 코드 */
  width: 170px; /* 이름 너비 */
  border-bottom: solid 1px #cdcdcd;
  background-color: white; /* sticky 적용을 위한 코드 */
  color: black;
`;

export const ThSecondHeader = styled.th`
  position: 'sticky'; /* sticky 적용을 위한 코드 */
  left: '170px'; /* sticky 적용을 위한 코드 */
  width: '80px'; /* 수정/삭제 너비 */
  border-bottom: 'solid 1px #cdcdcd';
  background-color: 'white'; /* sticky 적용을 위한 코드 */
  color: 'black';
`;

export const ThThirdHeader = styled.th<ThThirdHeaderProps>`
  display: tableCell; /* 테이블 셀 중앙정렬 */
  vertical-align: middle; /* 테이블 셀 중앙정렬 */
  text-align: start;
  padding-left: 5px;
  width: 50px; /* 시간 헤더(0~23) 너비 */
  /* height: '50px'; -> 변경 전: 60px */
  border-bottom: solid 1px #cdcdcd;
  /*  <ThThirdHeader key={hour} isLast={idx === headerHours.length - 1}>  */
  border-right: ${({ isLast }) => (isLast ? 'none' : 'solid 3px orange')};
  color: black;
  font-weight: 400;
  fontsize: 0.4rem;
`;

export const TbodyFirst = styled.tbody`
  background-color: 'white';
`;

export const ThNameHeader = styled.th`
  position: sticky; /* sticky 적용을 위한 코드 */
  left: 0; /* sticky 적용을 위한 코드 */
  width: 170px; /* 이름 너비 */
  /* background-color: white; -> sticky 적용을 위한 코드 */
  color: black;
`;

export const ThInfoHeader = styled.th`
  position: sticky; /* sticky 적용을 위한 코드 */
  width: 80px; /* 수정/삭제 너비 */
  left: 170px; /* sticky 적용을 위한 코드,ThNameHeader 너비가 170px */
  /* backgroundColor: white; -> sticky 적용을 위한 코드 */
`;

export const ButtonsWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;
