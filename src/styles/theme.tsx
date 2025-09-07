import { Sidebar } from '../components/Sidebar/Sidebar';

const theme = {
  /* disableDrag: 마우스 드래그 금지 */
  disableDrag: () => `
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  `,

  breakpoint: {
    maxWidth: '800px',
  },

  navbar: {
    height: '45px',
  },
  sidebar: {
    width: '200px',
  },

  mainColor: {
    light: 'rgba(252, 242, 216)',
    regular: '#fc6714',
    dark: '#fb460d',
  },
  color: {
    lightGrayLevel1: '#f3f3f3',
    lightGrayLevel2: '#cdcdcd',
    gray: '#b2b2b2',
    grayLevel2: '#9F9F9F',
  },

  fontSize: {
    regular: '0.8rem',
  },
};

export default theme;
