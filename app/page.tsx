import Link from 'next/link'

export default function Home() {
  return (
    <div style={{backgroundColor: '#FDF6EC', minHeight: '100vh'}}>

      {/* Nav */}
      <nav style={{borderBottom: '1px solid #D6C4AF', backgroundColor: 'white'}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1B4332'}}>
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>GrantPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium" style={{color: '#78716C'}}>Sign in</Link>
            <Link href="/auth" className="text-white text-sm font-semibold px-5 py-2 rounded-lg" style={{backgroundColor: '#1B4332'}}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-8" style={{backgroundColor: '#F5E6D3', color: '#1B4332'}}>
            <span>🌍</span><span>Built for African founders</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>
            Your business is fundable.{' '}
            <span style={{color: '#D97706'}}>Let's make sure funders know it.</span>
          </h1>
          <p className="text-xl leading-relaxed mb-10" style={{color: '#78716C'}}>
            African founders lose funding not because their businesses aren't viable —
            but because they can't translate their reality into the language international
            funders reward. GrantPilot bridges that gap.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-white font-semibold px-8 py-4 rounded-xl text-lg inline-block" style={{backgroundColor: '#1B4332'}}>
              Start Your Application →
            </Link>
            <span className="text-sm" style={{color: '#78716C'}}>Free · No credit card</span>
          </div>
        </div>

        {/* Grant pills */}
        <div className="mt-16">
          <p className="text-sm mb-4" style={{color: '#78716C'}}>Supports applications to</p>
          <div className="flex flex-wrap gap-3">
            {['Tony Elumelu Foundation','Y Combinator','Seedstars Africa','Google for Startups','Mastercard Foundation','African Dev Bank','Catapult Africa'].map(name => (
              <span key={name} className="text-sm font-medium px-4 py-2 rounded-full" style={{backgroundColor: '#F5E6D3', border: '1px solid #D6C4AF', color: '#1B4332'}}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-24" style={{backgroundColor: '#1B4332'}}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-3" style={{fontFamily: 'Georgia, serif'}}>
            The translation problem nobody talks about
          </h2>
          <p className="text-center mb-14" style={{color: '#86EFAC'}}>Same business. Same traction. Completely different outcome.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8" style={{backgroundColor: 'rgba(255,255,255,0.08)'}}>
              <p className="text-sm font-semibold mb-4" style={{color: '#FCA5A5'}}>❌ How most founders write it</p>
              <p className="leading-relaxed italic" style={{color: 'rgba(255,255,255,0.8)', fontSize: '15px'}}>
                "We provide electricity to underserved communities in Northern Nigeria using solar panels. We have 150 customers and want to expand."
              </p>
            </div>
            <div className="rounded-2xl p-8" style={{backgroundColor: 'rgba(255,255,255,0.08)', borderTop: '4px solid #D97706'}}>
              <p className="text-sm font-semibold mb-4" style={{color: '#86EFAC'}}>✅ How GrantPilot writes it</p>
              <p className="leading-relaxed italic" style={{color: 'rgba(255,255,255,0.9)', fontSize: '15px'}}>
                "We deliver last-mile energy access to 2,300 household members across peri-urban Northern Nigeria, reducing household energy expenditure by 40% while generating measurable carbon offset credits aligned with SDG 7 and creating 12 direct jobs in underserved communities."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24" style={{backgroundColor: '#FDF6EC'}}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-3" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>
            From idea to application in minutes
          </h2>
          <p className="text-center mb-16" style={{color: '#78716C'}}>No grant writing experience needed.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {icon: '📝', title: 'Describe your business', desc: 'Answer 8 focused questions about your business, customers, traction, and funding needs. Takes 5 minutes.'},
              {icon: '🎯', title: 'Choose your grant', desc: 'Select from 7 major African and global funding opportunities. Each has different criteria — we know them all.'},
              {icon: '✨', title: 'Get your application', desc: 'AI generates a complete, tailored application in the exact language each funder responds to. Edit and export.'}
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-8" style={{backgroundColor: '#F5E6D3', borderTop: '4px solid #1B4332'}}>
                <span className="text-4xl mb-5 block">{item.icon}</span>
                <h3 className="text-lg font-bold mb-3" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{color: '#78716C'}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{backgroundColor: '#D97706'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {number: '200,000+', label: 'TEF applications yearly'},
              {number: '7', label: 'Major grants supported'},
              {number: '8', label: 'Sections generated per application'},
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-5xl font-bold text-white mb-2" style={{fontFamily: 'Georgia, serif'}}>{stat.number}</p>
                <p className="text-sm" style={{color: 'rgba(255,255,255,0.85)'}}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center" style={{backgroundColor: '#FDF6EC'}}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>Ready to get funded?</h2>
          <p className="mb-10" style={{color: '#78716C'}}>Join African founders turning great businesses into funded businesses.</p>
          <Link href="/auth" className="text-white font-semibold px-10 py-4 rounded-xl text-lg inline-block" style={{backgroundColor: '#1B4332'}}>
            Start Your Application Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{borderTop: '1px solid #D6C4AF'}}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{backgroundColor: '#1B4332'}}>
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="font-bold" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>GrantPilot</span>
          </div>
          <p className="text-xs" style={{color: '#78716C'}}>Built for African founders 🌍</p>
        </div>
      </footer>
    </div>
  )
}