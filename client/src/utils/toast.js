import { toast } from 'react-hot-toast';

const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },
  warn: (message) => {
    toast(message, {
      duration: 3500,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#white',
      },
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

export default showToast;
