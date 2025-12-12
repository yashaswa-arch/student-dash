import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * SlideOver Component
 * A slide-in panel from the right side of the screen
 * 
 * @param {boolean} isOpen - Whether the slide-over is open
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Title of the slide-over
 * @param {ReactNode} children - Content to display
 */
const SlideOver = ({ isOpen, onClose, title, children }) => {
  const slideOverRef = useRef(null)

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Focus trap - focus first element when opened
  useEffect(() => {
    if (isOpen && slideOverRef.current) {
      const firstFocusable = slideOverRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            aria-hidden="true"
          />

          {/* Slide-over Panel */}
          <motion.div
            ref={slideOverRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-full md:w-96 lg:max-w-md bg-white dark:bg-dark-800 shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="slideover-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 id="slideover-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SlideOver

