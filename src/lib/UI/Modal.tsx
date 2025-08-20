import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ModalProps {
  onClose: () => void; // 모달 닫기 함수
  children: ReactNode; // 모달 안에 들어갈 내용
  width?: string; // 개별 스타일 조정 가능
  height?: string;
  fontSize?: string;
}

export const Modal = ({
  onClose,
  children,
  width = 'auto',
  height = 'auto',
  fontSize = '0.8rem',
}: ModalProps) => {
  return (
    <Background onClick={onClose}>
      <Container
        onClick={e => e.stopPropagation()}
        $width={width}
        $height={height}
        $fontSize={fontSize}
      >
        {children}
      </Container>
    </Background>
  );
};

const Background = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* rgba(0, 0, 0, 0.3) */
  z-index: 999;
`;

const Container = styled.div<{
  $width: string;
  $height: string;
  $fontSize: string;
}>`
  padding: 1rem;
  border-radius: 0.4rem;
  background: white;
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  font-size: ${({ $fontSize }) => $fontSize}; /* 기본 1rem = 16px */
`;
