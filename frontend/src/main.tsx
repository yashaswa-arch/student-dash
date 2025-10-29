import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { store, persistor } from './store/index.ts'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-accent-500"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>} persistor={persistor}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)