'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, field: 'business_name', question: "What's your business name and what do you do?", placeholder: "e.g. SolarNaija — we provide affordable solar energy to rural households in Northern Nigeria", hint: "Give us the name and a one-liner description" },
  { id: 2, field: 'problem', question: "What problem are you solving?", placeholder: "e.g. 80 million Nigerians have no access to reliable electricity, forcing families to spend 30% of income on generators and kerosene", hint: "Be specific — use numbers where you can" },
  { id: 3, field: 'customers', question: "Who are your customers?", placeholder: "e.g. Rural and peri-urban households in Northern Nigeria earning $2–$10/day, primarily women-led households", hint: "Describe them specifically — demographics, location, income level" },
  { id: 4, field: 'country', question: "What country or region do you operate in?", placeholder: "e.g. Nigeria (Kano, Kaduna, Sokoto states)", hint: "Be specific about your geography" },
  { id: 5, field: 'sector', question: "What sector is your business in?", placeholder: "e.g. Clean Energy / Renewable Energy", hint: "e.g. Fintech, Agritech, Health, Education, Energy, Logistics, E-commerce" },
  { id: 6, field: 'stage', question: "What stage is your business at?", placeholder: "e.g. Early revenue — we have 150 paying customers across 3 communities", hint: "Idea / Pre-revenue / Early revenue / Growth / Scaling" },
  { id: 7, field: 'traction', question: "What traction do you have so far?", placeholder: "e.g. 150 households connected, ₦2.1M revenue in last 6 months, 3 community partnerships signed, 12 jobs created", hint: "Numbers matter here — users, revenue, impact metrics, partnerships" },
  { id: 8, field: 'funding_use', question: "What will you use the funding for?", placeholder: "e.g. Purchase 200 additional solar kits ($3,000), hire 2 community sales agents ($1,000), working capital ($1,000)", hint: "Break it down — specific amounts and purposes" }
]

export default function NewProfile() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (!answers[step.field]?.trim()) { setError('Please answer this question before continuing'); return }
    setError('')
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => { setError(''); setCurrentStep(prev => prev - 1) }

  const handleSubmit = async () => {
    if (!answers[step.field]?.trim()) { setError('Please answer this question before continuing'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data, error: dbError } = await supabase.from('business_profiles').insert({
      user_id: user.id,
      business_name: answers.business_name,
      description: answers.business_name,
      problem: answers.problem,
      customers: answers.customers,
      country: answers.country,
      sector: answers.sector,
      stage: answers.stage,
      traction: answers.traction,
      funding_use: answers.funding_use
    }).select().single()
    if (dbError) { setError(dbError.message); setLoading(false); return }
    if (typeof pendo !== 'undefined') {
      pendo.track('business_profile_created', {
        business_name: answers.business_name,
        country: answers.country,
        sector: answers.sector,
        stage: answers.stage,
        steps_completed: steps.length
      })
    }
    router.push(`/apply/${data.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#FDF6EC'}}>
      <div className="w-full max-w-2xl rounded-2xl" style={{backgroundColor: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #D6C4AF'}}>

        {/* Header */}
        <div className="p-6" style={{borderBottom: '1px solid #E8D9C8'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1B4332'}}>
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <span className="font-bold" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>GrantPilot</span>
            </div>
            <span className="text-sm" style={{color: '#78716C'}}>Step {currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full rounded-full h-2" style={{backgroundColor: '#F5E6D3'}}>
            <div className="h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`, backgroundColor: '#1B4332'}} />
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4" style={{backgroundColor: '#F5E6D3'}}>
              <span className="font-bold" style={{color: '#1B4332'}}>{currentStep + 1}</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{fontFamily: 'Georgia, serif', color: '#1C1917'}}>{step.question}</h2>
            <p className="text-sm" style={{color: '#78716C'}}>{step.hint}</p>
          </div>

          <textarea
            value={answers[step.field] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [step.field]: e.target.value }))}
            placeholder={step.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
            style={{border: '1px solid #D6C4AF', backgroundColor: '#FDF6EC'}}
          />

          {error && (
            <div className="mt-3 text-sm px-4 py-2.5 rounded-lg" style={{backgroundColor: '#FEF2F2', color: '#DC2626'}}>{error}</div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-5 py-2.5 text-sm font-medium disabled:opacity-30"
            style={{color: '#78716C'}}
          >
            ← Back
          </button>
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-white font-medium px-8 py-2.5 rounded-lg text-sm disabled:opacity-50"
              style={{backgroundColor: '#1B4332'}}
            >
              {loading ? 'Saving...' : 'Save & Choose Grant →'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="text-white font-medium px-8 py-2.5 rounded-lg text-sm"
              style={{backgroundColor: '#1B4332'}}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}