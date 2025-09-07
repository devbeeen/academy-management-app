import React from 'react';
import styled from 'styled-components';
import spinnerGIF from '../../../public/data/loading-200x200.gif';

import { useUIStore } from '../../store/uiStore';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export const LoadingSpinner = ({ isLoading }: LoadingSpinnerProps) => {
  if (!isLoading) return null;

  // const isLoading = useUIStore(state => state.isLoading); // 로딩 스피너
  // const handleLoading = useUIStore(state => state.handleLoading); // 로딩 스피너

  // if (isLoading) {
  //   return (
  //     <>
  //      <LoadingWrap>
  //         <LoadingGIF src="/data/loading-200x200.gif" />
  //       </LoadingWrap>
  //     </>
  //   );
  // }

  return (
    <>
      <LoadingWrap>
        {/* <LoadingGIF src="/data/loading-200x200.gif" /> */}
        <LoadingGIF src={spinnerGIF} alt="Loading..." />
      </LoadingWrap>
    </>
  );
};

const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
  min-height: 300px; // 자리 확보
`;

const LoadingGIF = styled.img`
  ${({ theme }) => theme.loadingGIF};
  width: 6rem;
  height: 6rem;
`;
