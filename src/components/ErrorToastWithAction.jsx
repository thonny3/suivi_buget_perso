import React from 'react'

const ErrorToastWithAction = ({ message, actionText, onAction, onDismiss }) => {
  return (
    <div className="flex flex-col items-center space-y-3 text-center">
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-900">{message}</span>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200"
        >
          {actionText}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

export default ErrorToastWithAction
