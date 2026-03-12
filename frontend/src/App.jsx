/**
 * App.jsx — Root Component
 *
 * A minimal wrapper that delegates all rendering to AppRoutes.
 * Keeping this file intentionally thin makes it straightforward to add
 * top-level error boundaries or theme providers here in the future
 * without touching the route or page logic.
 */
import './App.css'
import AppRoutes from './routes/AppRoutes'

/**
 * App
 * The root React component. Renders the centralised route tree,
 * which injects the correct page based on the current URL.
 */
function App() {
  // All navigation and page rendering is handled inside AppRoutes
  return <AppRoutes />
}

export default App
