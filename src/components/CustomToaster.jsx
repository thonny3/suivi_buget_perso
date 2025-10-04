import { Toaster } from 'react-hot-toast'

const CustomToaster = () => {
  return (
    <Toaster 
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '16px 24px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          minWidth: '300px',
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        },
        success: {
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#059669',
            border: '2px solid #10b981',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#dc2626',
            border: '2px solid #ef4444',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
            minWidth: '320px', // Plus large pour les boutons
            maxWidth: '600px',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}

export default CustomToaster
