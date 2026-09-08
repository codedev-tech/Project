import { Component } from 'react'
import '../styles/systemStatus.css'

export default class AppErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (!this.state.failed) return this.props.children
    return <main className="system-recovery">
      <section className="system-recovery__card" aria-labelledby="app-error-title">
        <h1 id="app-error-title">This page could not be displayed</h1>
        <p role="alert">Something went wrong while opening this page. Check your connection, then reload to try again.</p>
        <p>Reloading may clear unsaved form entries. If you were saving a change, check the record before submitting it again.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload page</button>
      </section>
    </main>
  }
}
