import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, setInitialized } from '../store/features/auth/authSlice';

const LOGOUT_MARKER_KEY = 'edutrack_logout_marker';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const hasFetched = useRef(false);

  useEffect(() => {
    const hasLoggedOut = typeof window !== 'undefined' && localStorage.getItem(LOGOUT_MARKER_KEY) === 'true';

    if (hasLoggedOut) {
      hasFetched.current = true;
      if (!initialized) {
        dispatch(setInitialized(true));
      }
      return;
    }

    if (!initialized && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch, initialized]);

  return { user, isAuthenticated, initialized };
};

export default useAuth;
