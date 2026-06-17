'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const grants = [
  {
    slug: 'tony-elumelu',
    name: 'Tony Elumelu Foundation',
    provider: 'TEF',
    amount: '$5,000',
    description: 'Empowering African entrepreneurs across all 54 African countries with funding and mentorship.',
    tags: ['Pan-African', 'All sectors', 'Early stage'],
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700'
  },
  {
    slug: 'yc',
    name: 'Y Combinator',
    provider: 'YC',
    amount: '$500,000',
    description: 'The world\'s most prestigious startup accelerator. Twice yearly batches.',
    tags: ['Global', 'Tech', 'High growth'],
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700'
  },
  {
    slug: 'seedstars',
    name: 'Seedstars Africa',
    provider: 'Seedstars',
    amount: '$500,000',
    description: 'Early-stage investment for high-growth startups in emerging markets.',
    tags: ['Africa', 'Early stage', 'Impact'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700'
  },
  {
    slug: 'google-startups',
    name: 'Google for Startups Africa',
    provider: 'Google',
    amount: '$200k credits',
    description: 'Equity-free support, cloud credits, and mentorship for African tech startups.',
    tags: ['Africa', 'Tech', 'Equity-free'],
    color: 'bg-[#F5E6D3] border-[#D6C4AF]',
    badge: 'bg-[#DCF0E4] text-[#1B4332]'
  },
  {
    slug: 'mastercard-foundation',
    name: 'Mastercard Foundation',
    provider: 'Mastercard',
    amount: 'Varies',
    description: 'Supporting young Africans to access dignified work and financial inclusion.',
    tags: ['Youth', 'Financial inclusion', 'Africa'],
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700'
  },
  {
    slug: 'afawa',
    name: 'AFAWA — African Dev Bank',
    provider: 'AfDB',
    amount: 'Varies',
    description: 'Affirmative Finance Action for Women in Africa.',
    tags: ['Women-led', 'Africa', 'Finance'],
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700'
  },
  {
    slug: 'catapult',
    name: 'Catapult: Innovate for Africa',
    provider: 'Catapult',
    amount: 'Varies',
    description: 'Pan-African innovation challenge for scalable solutions to Africa\'s biggest challenges.',
    tags: ['Innovation', 'Pan-African', 'Impact'],
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700'
  }
]

export default function ApplyPage({ params }: { params: { profileId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', params.profileId)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [params.profileId])

  const handleSelectGrant = async (grantSlug: string) => {
    setSelectedGrant(grantSlug)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    // Get grant id from DB
    const { data: grantData } = await supabase
      .from('grants')
      .select('id')
      .eq('slug', grantSlug)
      .single()

    if (!grantData) {
      alert('Grant not found. Make sure you ran the seed SQL in Supabase.')
      setLoading(false)
      return
    }

    // Create application record
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        profile_id: params.profileId,
        grant_id: grantData.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const grantInfo = grants.find(g => g.slug === grantSlug)
    if (typeof window !== 'undefined' && window.pendo) {
      pendo.track('grant_selected', {
        grant_slug: grantSlug,
        grant_name: grantInfo?.name || grantSlug,
        profile_id: params.profileId,
        application_id: application.id,
      })
    }

    router.push(`/generate/${application.id}`)
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Header */}
      <header className="bg-white border-b border-[#D6C4AF]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B4332] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="font-bold text-gray-900">GrantPilot</span>
          </div>
          {profile && (
            <span className="text-sm text-gray-500">
              Profile: <span className="font-medium text-gray-700">{profile.business_name}</span>
            </span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Choose Your Grant 🎯
          </h1>
          <p className="text-gray-500 mt-1">
            Select the funding opportunity you want to apply for. We'll generate a tailored application.
          </p>
        </div>

        {/* Grant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grants.map((grant) => (
            <div
              key={grant.slug}
              className={`border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md ${
                selectedGrant === grant.slug
                  ? 'border-[#1B4332] bg-[#F5E6D3]'
                  : `${grant.color}`
              }`}
              onClick={() => !loading && handleSelectGrant(grant.slug)}
            >
              {/* Grant header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{grant.name}</h3>
                  <p className="text-[#1B4332] font-semibold text-lg mt-0.5">{grant.amount}</p>
                </div>
                {selectedGrant === grant.slug && loading && (
                  <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {grant.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {grant.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${grant.badge}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Select button */}
              <button
                disabled={loading}
                className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGrant === grant.slug
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-white text-gray-700 border border-[#D6C4AF] hover:border-[#2D6A4F]'
                }`}
              >
                {selectedGrant === grant.slug && loading
                  ? 'Creating application...'
                  : 'Select this grant →'
                }
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}