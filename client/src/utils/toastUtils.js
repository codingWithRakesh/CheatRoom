import { toast } from 'react-toastify';

export const handleSuccess = (msg) => {
  toast.success(msg, {
    position: 'top-center',
    style: { backgroundColor: '#18181B', color: '#fff', borderRadius: '10px', border: '1px solid #374151',zIndex: 9999999 }
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    position: 'top-center',
    style: { backgroundColor: '#18181B', color: '#fff', borderRadius: '10px', border: '1px solid #374151',zIndex: 9999999 }
  });
};
