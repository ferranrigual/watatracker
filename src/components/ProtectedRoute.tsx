import { Session } from '@supabase/supabase-js'
import { Navigate } from 'react-router-dom'

interface Props {
  session: Session | null
  children: React.ReactNode
}

export default function ProtectedRoute({ session, children }: Props) {
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
