import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword, clearError } from '../../store/features/auth/authSlice';
import showToast from '../../utils/toast';

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      showToast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast.error('Password must be at least 8 characters');
      return;
    }

    const result = await dispatch(
      updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      })
    );

    if (result.type.includes('fulfilled')) {
      showToast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password *
          </label>
          <input
            type="password"
            name="currentPassword"
            placeholder="Enter Current Password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password *
          </label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter New Password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm Password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
