import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../store/features/auth/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!initialized && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch, initialized]);

  return { user, isAuthenticated, initialized };
};

export default useAuth;
