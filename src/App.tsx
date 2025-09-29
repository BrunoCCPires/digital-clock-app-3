import React from 'react'
import { useSubscribeDev } from '@subscribe.dev/react'
import './App.css'

// Sign-in screen component
function SignInScreen({ signIn }: { signIn: () => void }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Digital Clock</h1>
        <p className="auth-description">
          A beautiful digital clock with customizable preferences, powered by AI
        </p>
        <button onClick={signIn} className="btn btn-primary">
          Sign In
        </button>
      </div>
    </div>
  )
}

// Authenticated app component with digital clock
function AuthenticatedClockApp() {
  const { useStorage, signOut, user, usage, subscriptionStatus, subscribe } = useSubscribeDev()

  // Clock preferences stored in cloud
  const [preferences, setPreferences, syncStatus] = useStorage('clock-preferences', {
    format24h: false,
    showSeconds: true,
    showDate: true,
    lastViewedAt: Date.now()
  })

  // Update last viewed timestamp
  const updateLastViewed = () => {
    setPreferences({
      ...preferences,
      lastViewedAt: Date.now()
    })
  }

  // Current time state
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    updateLastViewed()
  }, [])

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()

    if (preferences.format24h) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${preferences.showSeconds ? `:${String(seconds).padStart(2, '0')}` : ''}`
    } else {
      const displayHours = hours % 12 || 12
      const period = hours >= 12 ? 'PM' : 'AM'
      return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${preferences.showSeconds ? `:${String(seconds).padStart(2, '0')}` : ''} ${period}`
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const lastViewed = preferences.lastViewedAt
    ? new Date(preferences.lastViewedAt).toLocaleString()
    : 'Never'

  return (
    <div className="clock-app">
      {/* Header with user info */}
      <header className="app-header">
        <div className="header-content">
          <h2 className="app-logo">Digital Clock</h2>
          <div className="user-info">
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="User avatar" className="user-avatar" />
            )}
            <span className="user-email">{user?.email}</span>
            <button onClick={signOut} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main clock display */}
      <main className="clock-container">
        <div className="clock-display">
          <div className="time">{formatTime(currentTime)}</div>
          {preferences.showDate && (
            <div className="date">{formatDate(currentTime)}</div>
          )}
        </div>

        {/* Clock preferences */}
        <div className="preferences-card">
          <h3>Clock Preferences</h3>
          <div className="preferences-grid">
            <label className="preference-item">
              <input
                type="checkbox"
                checked={preferences.format24h}
                onChange={(e) =>
                  setPreferences({ ...preferences, format24h: e.target.checked })
                }
              />
              <span>24-hour format</span>
            </label>
            <label className="preference-item">
              <input
                type="checkbox"
                checked={preferences.showSeconds}
                onChange={(e) =>
                  setPreferences({ ...preferences, showSeconds: e.target.checked })
                }
              />
              <span>Show seconds</span>
            </label>
            <label className="preference-item">
              <input
                type="checkbox"
                checked={preferences.showDate}
                onChange={(e) =>
                  setPreferences({ ...preferences, showDate: e.target.checked })
                }
              />
              <span>Show date</span>
            </label>
          </div>
          <div className="sync-status">
            Sync status: <span className={`status-${syncStatus}`}>{syncStatus}</span>
          </div>
          <div className="last-viewed">Last viewed: {lastViewed}</div>
        </div>

        {/* Subscription info */}
        <div className="subscription-card">
          <h3>Account Details</h3>
          <div className="subscription-info">
            <div className="info-row">
              <span className="label">Plan:</span>
              <span className="value">{subscriptionStatus?.plan?.name ?? 'Free'}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className="value">{subscriptionStatus?.status ?? 'none'}</span>
            </div>
            <div className="info-row">
              <span className="label">Credits:</span>
              <span className="value">{usage?.remainingCredits ?? 0} remaining</span>
            </div>
          </div>
          {subscribe && (
            <button onClick={subscribe} className="btn btn-primary">
              Manage Subscription
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// Main App component with conditional rendering
function App() {
  const { isSignedIn, signIn } = useSubscribeDev()

  if (!isSignedIn) {
    return <SignInScreen signIn={signIn} />
  }

  return <AuthenticatedClockApp />
}

export default App
