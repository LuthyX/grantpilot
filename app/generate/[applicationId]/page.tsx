'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const sections = [
  { key: 'executive_summary', label: 'Executive Summary', icon: '⭐' },
  { key: 'problem_statement', label: 'Problem Statement', icon: '🎯' },
  { key: 'solution', label: 'Our Solution', icon: '💡' },
  { key: 'market_opportunity', label: 'Market Opportunity', icon: '📈' },
  { key: 'traction', label: 'Traction', icon: '🚀' },
  { key: 'team', label: 'Team', icon: '👥' },
  { key: 'funding_use', label: 'Use of Funds', icon: '💰' },
  { key: 'impact', label: 'Impact', icon: '🌍' },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80
    ? 'bg-[#DCF0E4] text-[#1B4332]'
    : score >= 60
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/100
    </span>
  )
}

export default function GeneratePage({ params }: { params: { applicationId: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [grant, setGrant] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('executive_summary')
  const [generatedSections, setGeneratedSections] = useState<Record<string, string>>({})
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: app } = await supabase
        .from('applications')
        .select('*')
        .eq('id', params.applicationId)
        .single()

      if (!app) { router.push('/dashboard'); return }

      setApplication(app)

      // Restore saved sections
      if (app.sections) setGeneratedSections(app.sections)
      if (app.scores) setScores(app.scores)

      const { data: prof } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', app.profile_id)
        .single()
      setProfile(prof)

      const { data: gr } = await supabase
        .from('grants')
        .select('*')
        .eq('id', app.grant_id)
        .single()
      setGrant(gr)

      setLoading(false)
    }
    fetchData()
  }, [params.applicationId, router])

  const generateSection = async (sectionKey: string) => {
    if (!profile || !grant) return
    setGenerating(true)
    setEditMode(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfile: profile,
          grantSlug: grant.slug,
          sectionKey
        })
      })

      const data = await response.json()

      if (data.error) {
        alert('Generation failed: ' + data.error)
        return
      }

      const isRegeneration = !!generatedSections[sectionKey]
      const newSections = { ...generatedSections, [sectionKey]: data.content }
      const newScores = { ...scores, [sectionKey]: data.score }

      setGeneratedSections(newSections)
      setScores(newScores)
      setEditContent(data.content)

      if (typeof window !== 'undefined' && window.pendo) {
        const sectionInfo = sections.find(s => s.key === sectionKey)
        pendo.track('section_generated', {
          section_key: sectionKey,
          section_label: sectionInfo?.label || sectionKey,
          grant_slug: grant.slug,
          score: data.score,
          content_length: data.content?.length || 0,
          is_regeneration: isRegeneration,
        })
      }

      // Save to Supabase
      await supabase
        .from('applications')
        .update({ sections: newSections, scores: newScores })
        .eq('id', params.applicationId)

    } catch (err) {
      alert('Something went wrong. Check your API key.')
    }

    setGenerating(false)
  }

  const saveEdit = async () => {
    const newSections = { ...generatedSections, [activeSection]: editContent }
    setGeneratedSections(newSections)
    setEditMode(false)

    if (typeof window !== 'undefined' && window.pendo) {
      const sectionInfo = sections.find(s => s.key === activeSection)
      pendo.track('section_edited', {
        section_key: activeSection,
        section_label: sectionInfo?.label || activeSection,
        content_length: editContent?.length || 0,
        application_id: params.applicationId,
      })
    }

    await supabase
      .from('applications')
      .update({ sections: newSections })
      .eq('id', params.applicationId)
  }

  const completedCount = sections.filter(s => generatedSections[s.key]).length
  const allComplete = completedCount === sections.length

  const activeContent = generatedSections[activeSection] || ''
  const activeScore = scores[activeSection]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading your application...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Header */}
      <header className="bg-white border-b border-[#D6C4AF]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B4332] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">GrantPilot</span>
              {grant && (
                <span className="text-gray-400 text-sm ml-2">→ {grant.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {completedCount}/{sections.length} sections complete
            </span>
            {allComplete && (
              <button
                onClick={() => router.push(`/application/${params.applicationId}`)}
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Review & Export →
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left sidebar — sections list */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-[#D6C4AF] overflow-hidden">
            <div className="p-4 border-b border-[#E8D9C8]">
              <h2 className="font-semibold text-gray-900 text-sm">Application Sections</h2>
              <div className="mt-2 bg-[#F5E6D3] rounded-full h-1.5">
                <div
                  className="bg-[#1B4332] h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedCount / sections.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {sections.map((section) => {
                const isDone = !!generatedSections[section.key]
                const isActive = activeSection === section.key
                return (
                  <button
                    key={section.key}
                    onClick={() => {
                      setActiveSection(section.key)
                      setEditMode(false)
                      setEditContent(generatedSections[section.key] || '')
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-[#F5E6D3]' : 'hover:bg-[#FDF6EC]'
                    }`}
                  >
                    <span className="text-base">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? 'text-[#1B4332]' : 'text-gray-700'
                      }`}>
                        {section.label}
                      </p>
                    </div>
                    {isDone ? (
                      <span className="text-[#1B4332] text-xs">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xs">○</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right panel — content editor */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-[#D6C4AF] p-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {sections.find(s => s.key === activeSection)?.icon}
                </span>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {sections.find(s => s.key === activeSection)?.label}
                  </h2>
                  {activeScore && <ScoreBadge score={activeScore} />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeContent && !editMode && (
                  <button
                    onClick={() => { setEditMode(true); setEditContent(activeContent) }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-[#D6C4AF] rounded-lg"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => generateSection(activeSection)}
                  disabled={generating}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : activeContent ? 'Regenerate' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Content area */}
            {!activeContent && !generating && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-semibold text-gray-900 mb-2">Ready to generate</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Click Generate to create this section tailored to {grant?.name}
                </p>
                <button
                  onClick={() => generateSection(activeSection)}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-medium px-6 py-2.5 rounded-lg"
                >
                  Generate {sections.find(s => s.key === activeSection)?.label}
                </button>
              </div>
            )}

            {generating && (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Writing your {sections.find(s => s.key === activeSection)?.label}...
                </p>
              </div>
            )}

            {activeContent && !generating && (
              <>
                {editMode ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border border-[#D6C4AF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none leading-relaxed"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={saveEdit}
                        className="bg-[#1B4332] text-white text-sm font-medium px-4 py-2 rounded-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="text-gray-500 text-sm px-4 py-2 border border-[#D6C4AF] rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {activeContent}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Generate all button */}
            {completedCount === 0 && (
            <div className="mt-4 bg-[#F5E6D3] border border-[#D6C4AF] rounded-2xl p-4 flex items-center justify-between">
                <div>
                <p className="font-medium text-[#1B4332] text-sm">Generate all sections at once</p>
                <p className="text-[#1B4332] text-xs mt-0.5">We'll write all 8 sections automatically</p>
                </div>
                <button
                onClick={async () => {
                    if (!profile || !grant) return
                    setGenerating(true)

                    const allSections: Record<string, string> = {}
                    const allScores: Record<string, number> = {}

                    for (const section of sections) {
                    setActiveSection(section.key)
                    try {
                        const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessProfile: profile,
                            grantSlug: grant.slug,
                            sectionKey: section.key
                        })
                        })
                        const data = await response.json()
                        if (data.content) {
                        allSections[section.key] = data.content
                        allScores[section.key] = data.score
                        // Update UI progressively
                        setGeneratedSections(prev => ({ ...prev, [section.key]: data.content }))
                        setScores(prev => ({ ...prev, [section.key]: data.score }))
                        }
                    } catch (err) {
                        console.error(`Failed to generate ${section.key}`)
                    }
                    }

                    // Save everything to Supabase once at the end
                    await supabase
                    .from('applications')
                    .update({ sections: allSections, scores: allScores })
                    .eq('id', params.applicationId)

                    const generatedCount = Object.keys(allSections).length
                    const failedCount = sections.length - generatedCount
                    const scoreValues = Object.values(allScores)
                    const avgScore = scoreValues.length > 0
                      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                      : 0

                    if (typeof window !== 'undefined' && window.pendo) {
                      pendo.track('all_sections_generated', {
                        grant_slug: grant.slug,
                        grant_name: grant.name,
                        sections_generated_count: generatedCount,
                        sections_failed_count: failedCount,
                        average_score: avgScore,
                        application_id: params.applicationId,
                      })
                    }

                    setGenerating(false)
                }}
                disabled={generating}
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                {generating ? 'Generating...' : 'Generate All →'}
                </button>
            </div>
            )}
        </div>
      </div>
    </div>
  )
}