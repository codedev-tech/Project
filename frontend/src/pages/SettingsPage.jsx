/**
 * SettingsPage.jsx — System Configuration
 *
 * Provides UI controls for adjusting key system parameters.
 * Currently uses uncontrolled inputs (defaultValue) for simplicity
 * since settings are not yet persisted to a backend.
 *
 * Sections:
 *   General         — System name label and GPS update interval
 *   Realtime Server — Socket.IO server URL and auto-reconnect toggle
 *
 * To persist settings: replace defaultValue with useState + a PUT /api/settings call.
 */
function SettingsPage() {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">System configuration and preferences</p>
      </div>

      <div className="settings-grid">
        <div className="widget-card slide-up">
          <h3 className="widget-title">General</h3>
          <div className="settings-row">
            <div>
              <p className="settings-label">System Name</p>
              <p className="settings-hint">Label shown in the header</p>
            </div>
            <input className="settings-input" defaultValue="BantayCabagan" />
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">GPS Update Interval</p>
              <p className="settings-hint">How often positions refresh (ms)</p>
            </div>
            <input className="settings-input" type="number" defaultValue={4000} />
          </div>
        </div>

        <div className="widget-card slide-up">
          <h3 className="widget-title">Realtime Server</h3>
          <div className="settings-row">
            <div>
              <p className="settings-label">Socket URL</p>
              <p className="settings-hint">Backend server address</p>
            </div>
            <input className="settings-input" defaultValue="http://localhost:4000" />
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">Auto-reconnect</p>
              <p className="settings-hint">Reconnect when connection drops</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-knob" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
