import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ButtonProps {
  handleClick: () => void; // 이벤트 함수(모달 열기, 이벤트 실행 등)
  children: ReactNode; // 모달 안에 들어갈 내용
  width?: string; // 개별 스타일 조정 가능
  height?: string;
  fontSize?: string;
}

export const Button = ({
  handleClick,
  children,
  width = 'auto',
  height = 'auto',
  fontSize = '0.8rem',
}: ButtonProps) => {
  return (
    <ButtonElement
      onClick={handleClick}
      $width={width}
      $height={height}
      $fontSize={fontSize}
    >
      {children}
    </ButtonElement>
  );
};

const ButtonElement = styled.button<{
  $width: string;
  $height: string;
  $fontSize: string;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.4rem;
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  border: solid 1px ${({ theme }) => theme.color.gray};
  border-radius: 0.4rem;
  background-color: white;
  font-size: ${({ $fontSize }) => $fontSize}; /* 기본 1rem = 16px */
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.lightGrayLevel1};
  }
`;
