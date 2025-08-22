import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { useShallow } from 'zustand/react/shallow';

export default function PrivateRoute({ authentication }) {
  const { id } = useUserStore(useShallow(state => state));
  /**
   * Boolean(id)와 같은 의미. '값을 확실히 불린(Boolean)으로 변환한다'.
   * id가 truthy면 true를 반환, falsy면 false를 반환 (id가 존재하면 true, 없으면 false)
   * null, undefined, '' 전부 false
   */
  const isLoggedIn = !!id;
  console.log('isLoggedIn: ', isLoggedIn);
  console.log('id: ', id);

  if (authentication) {
    // 인증이 필요한 페이지
    // 인증을 안했을 경우 로그인 페이지로, 했을 경우 해당 페이지로
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
    // return isLoggedIn ? <Navigate to="/login" /> : <Outlet />;
  }

  // 인증이 필요 없는 페이지
  // 인증을 안했을 경우 해당 페이지로, 인증을 한 상태일 경우 main페이지로
  // return isLoggedIn ? <Navigate to="/" /> : <Outlet />;
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
}
