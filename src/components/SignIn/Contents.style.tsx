import styled from 'styled-components';

export const Section = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  div {
    &.login-button {
      margin-top: 10px;
    }
  }
`;

export const Wrap = styled.div`
display:flex
flex-direction: column;
`;

export const Title = styled.div`
  color: red;
  /* margin-bottom: 40px; */
  font-size: 32px;
  font-weight: 600;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  /* align-items: center; */
`;

export const ItemBox = styled.div`
  margin: 10px 0;

  &. password-box {
    margin-top: 100px;
  }
`;
