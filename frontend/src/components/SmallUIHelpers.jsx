import React from 'react'

/**
 * Small UI Helper Components
 * Minimal implementations for common UI elements
 */

/**
 * Card Component - Simple container with shadow and border
 */
export const Card = ({ children, className = '', testId, onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * Loader Component - Simple spinning loader
 */
export const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}
      ></div>
    </div>
  )
}

/**
 * ErrorMessage Component - Displays error message
 */
export const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
    </div>
  )
}

export default { Card, Loader, ErrorMessage }

