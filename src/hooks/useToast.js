import toast from 'react-hot-toast'
import ErrorToastWithAction from '@/components/ErrorToastWithAction'

export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      ...options
    })
  }

  const showErrorWithAction = (message, actionText, onAction, options = {}) => {
    return toast.error(
      (t) => (
        <ErrorToastWithAction
          message={message}
          actionText={actionText}
          onAction={() => {
            onAction()
            toast.dismiss(t.id)
          }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: 8000, // Plus long pour laisser le temps de cliquer
        style: {
          background: '#ffffff',
          color: '#dc2626',
          border: '2px solid #ef4444',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
          minWidth: '320px',
          maxWidth: '600px',
          padding: '20px 24px',
        },
        ...options
      }
    )
  }

  const showLoading = (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      style: {
        background: '#ffffff',
        color: '#3b82f6',
        border: '2px solid #3b82f6',
        textAlign: 'center',
      },
      ...options
    })
  }

  const dismiss = (toastId) => {
    toast.dismiss(toastId)
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  return {
    showSuccess,
    showError,
    showErrorWithAction,
    showLoading,
    showInfo,
    dismiss,
    dismissAll
  }
}

export default useToast
