import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyle = createGlobalStyle`
${reset}

* {
  font-family: 'Noto Sans KR', sans-serif;
  letter-spacing: -0.8;
  box-sizing: border-box;
}

body {
  /* 👇 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 0.5em;
    background-color: #c1c1c1;
  }
  ::-webkit-scrollbar-track {
    border-radius: 0.5em;
    background-color: #f8f9fa;
    border-bottom: '#c1c1c1';
  }
  /* 👆 스크롤바 스타일 */
}

a {
  text-decoration: none;
}

input {
  border: none;
  background: transparent;
}

input:focus {
  outline: none;
}

ol, ul, li {
  list-style: none;
}

img {
  display: block;
  width: 100%
  height: 100%
}

button {
  padding: 0;
  border: none;
  background-color: transparent;
}
`;

export default GlobalStyle;
