/**
 * PersonnelContext.jsx — Global Realtime Personnel State
 *
 * A React context that makes live GPS and connection data available to every
 * page and component without prop-drilling. The data comes from the
 * usePersonnelRealtime hook which maintains the Socket.IO subscription.
 *
 * How to use:
 *   1. <PersonnelProvider> wraps the app tree in main.jsx (already done).
 *   2. Call usePersonnelContext() inside any child component to access data.
 *
 * Context value shape (from usePersonnelRealtime):
 *   {
 *     personnel:      Officer[]  — live array of officer objects with GPS coords
 *     personnelCount: number     — derived count (avoids recomputing in every consumer)
 *     isConnected:    boolean    — true when the socket is connected to the backend
 *     statusMessage:  string     — human-readable connection / event status for the UI
 *   }
 */
import { usePersonnelRealtime } from '../hooks/usePersonnelRealtime'
import { PersonnelContext } from './PersonnelContextObject'

/**
 * PersonnelProvider
 * Runs usePersonnelRealtime once at the top of the component tree and
 * distributes its return value to every descendant via the context API.
 * Only one Socket.IO subscription ever exists regardless of how many
 * components consume the context.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function PersonnelProvider({ children }) {
  // Run the hook here — this is the single source of truth for personnel data
  const value = usePersonnelRealtime()

  return (
    <PersonnelContext.Provider value={value}>
      {children}
    </PersonnelContext.Provider>
  )
}

