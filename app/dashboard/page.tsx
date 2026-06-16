'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const { data: profileData } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setProfiles(profileData || [])
      const { data: appData } = await supabase.from('applications').select('*, grants(name, max_amount)').eq('user_id', user.id).order('created_at', { ascending: false })
      setApplications(appData || [])
      setLoading(false)
    }
    getData()
  }, [router])

  const handleDelete = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation()
    if (!confirm('Delete this application? This cannot be undone.')) return
    const app = applications.find(a => a.id === appId)
    const sectionsCompleted = getSectionCount(app?.sections)
    setDeletingId(appId)
    await supabase.from('applications').delete().eq('id', appId)
    if (typeof pendo !== 'undefined') {
      pendo.track('application_deleted', {
        application_id: appId,
        grant_name: app?.grants?.name || 'unknown',
        sections_completed: sectionsCompleted,
        was_complete: sectionsCompleted === 8
      })
    }
    setApplications(prev => prev.filter(a => a.id !== appId))
    setDeletingId(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (typeof pendo !== 'undefined') {
      pendo.track('user_signed_out')
    }
    router.push('/auth')
  }

  const getProfileName = (profileId: string) =>
    profiles.find(p => p.id === profileId)?.business_name || 'Unknown Business'

  const getSectionCount = (sections: any) =>
    sections ? Object.keys(sections).filter(k => sections[k]).length : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FDF6EC'}}>
        <p style={{color: '#78716C'}}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{backgroundColor: '#FDF6EC', minHeight: '100vh'}}>
      {/* Header */}
      <header style={{backgroundColor: 'white', borderBottom: '1px solid #D6C4AF'}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1B4332'}}>
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>GrantPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{color: '#78716C'}}>{user?.email}</span>
            <button onClick={handleSignOut} className="text-sm" style={{color: '#78716C'}}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{color: '#78716C'}}>Your grant applications</p>
          </div>
          <button
            onClick={() => router.push('/profile/new')}
            className="text-white font-medium px-5 py-2.5 rounded-xl text-sm"
            style={{backgroundColor: '#1B4332'}}
          >
            + New Application
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{backgroundColor: 'white', border: '1px solid #D6C4AF', borderTop: '4px solid #1B4332'}}>
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-bold mb-2" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>No applications yet</h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{color: '#78716C'}}>
              Create your business profile and generate a tailored grant application in minutes.
            </p>
            <button
              onClick={() => router.push('/profile/new')}
              className="text-white font-medium px-6 py-3 rounded-xl"
              style={{backgroundColor: '#1B4332'}}
            >
              Create Business Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => {
              const sectionCount = getSectionCount(app.sections)
              const isComplete = sectionCount === 8
              return (
                <div
                  key={app.id}
                  className="rounded-2xl p-6 cursor-pointer relative group"
                  style={{backgroundColor: 'white', border: '1px solid #D6C4AF', borderTop: '4px solid #1B4332', transition: 'box-shadow 0.2s'}}
                  onClick={() => router.push(isComplete ? `/application/${app.id}` : `/generate/${app.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, app.id)}
                    disabled={deletingId === app.id}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{color: '#DC2626', backgroundColor: '#FEF2F2'}}
                  >
                    {deletingId === app.id ? '...' : '✕'}
                  </button>

                  <div className="mb-4">
                    <h3 className="font-bold" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>
                      {getProfileName(app.profile_id)}
                    </h3>
                    <p className="text-xs mt-0.5 font-medium" style={{color: '#D97706'}}>
                      {app.grants?.name || 'Unknown Grant'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5" style={{color: '#78716C'}}>
                      <span>Sections completed</span>
                      <span>{sectionCount}/8</span>
                    </div>
                    <div className="rounded-full h-1.5" style={{backgroundColor: '#F5E6D3'}}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{width: `${(sectionCount / 8) * 100}%`, backgroundColor: isComplete ? '#1B4332' : '#D97706'}}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={isComplete
                      ? {backgroundColor: '#DCFCE7', color: '#166534'}
                      : {backgroundColor: '#FEF9EC', color: '#D97706'}
                    }>
                      {isComplete ? '✓ Complete' : 'In Progress'}
                    </span>
                    <span className="text-xs" style={{color: '#78716C'}}>
                      {new Date(app.created_at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}