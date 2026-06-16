import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

const grantPrompts: Record<string, string> = {
  'tony-elumelu': `You are an expert grant writer specialising in Tony Elumelu Foundation (TEF) applications. 
TEF evaluates on: entrepreneurial capacity, business viability, African economic impact, job creation potential, and SDG alignment (SDG 1, 8, 10).
Write in a confident, impact-forward tone. Always quantify impact. Frame everything around African economic transformation.
Use specific metrics and numbers wherever possible. Highlight community impact and job creation strongly.`,

  'yc': `You are an expert at Y Combinator applications.
YC evaluates on: founder-market fit, clear problem definition, large market opportunity, early traction, and why now.
Be direct, specific, zero fluff. Use their language patterns: "We noticed X, so we built Y for Z people."
Lead with traction. Show you understand the market deeply. Be concise and punchy.`,

  'seedstars': `You are an expert at Seedstars Africa applications.
Seedstars evaluates on: scalability potential, impact in emerging markets, strong founding team, and market opportunity.
Frame the business around emerging market context. Emphasise growth trajectory and scalability.
Show deep understanding of the local market and competitive landscape.`,

  'google-startups': `You are an expert at Google for Startups Africa applications.
Google evaluates on: tech-enabled innovation, community impact, scalability, and team strength.
Emphasise the technology layer and how it creates leverage. Show community and ecosystem impact.
Use innovation-forward language. Highlight how the solution scales beyond the founding market.`,

  'mastercard-foundation': `You are an expert at Mastercard Foundation grant applications.
Mastercard Foundation evaluates on: youth employment creation, financial inclusion impact, gender lens, and systems change potential.
Use development finance language. Emphasise youth employment numbers strongly.
Frame impact using SDGs, particularly SDG 1, 5, 8, 10. Show pathway to systems-level change.`,

  'afawa': `You are an expert at African Development Bank AFAWA grant applications.
AFAWA evaluates on: women entrepreneurship support, access to finance improvement, job creation, and economic empowerment.
Use development bank language and framing. Emphasise gender empowerment strongly.
Quantify economic impact. Frame the business within Africa's broader development agenda.`,

  'catapult': `You are an expert at Catapult: Innovate for Africa applications.
Catapult evaluates on: innovation quality, scalability across African markets, measurable social impact, and pan-African potential.
Use innovation-forward language. Show how the solution addresses a pan-African challenge.
Emphasise measurable impact metrics and pathway to scale across multiple African countries.`
}

const sectionPrompts: Record<string, string> = {
  'executive_summary': `Write a compelling 150-word executive summary for this grant application.
Hook the reader in the first sentence. Cover: what the business does, the problem it solves, who it serves, key traction, and what the funding will achieve.
Make it punchy, specific, and memorable.`,

  'problem_statement': `Write a powerful 200-word problem statement.
Open with a striking statistic or human story. Quantify the problem scale. Show you understand the root causes.
Make the reader feel the urgency. End with why existing solutions are inadequate.`,

  'solution': `Write a clear 200-word solution description.
Explain exactly what the business does and how it works. Show why this approach is uniquely effective.
Highlight the innovation or insight that makes this different. Connect directly back to the problem.`,

  'market_opportunity': `Write a 150-word market opportunity section.
Define the total addressable market with specific numbers. Show the serviceable market you are targeting now.
Demonstrate market growth trends. Show why this market, why now.`,

  'traction': `Write a compelling 150-word traction section.
Lead with the strongest metrics first. Show momentum and growth trajectory.
Include: customers/users, revenue, partnerships, impact metrics, and key milestones hit.
Make numbers the hero of this section.`,

  'team': `Write a 150-word team section.
Highlight founder-market fit — why this team is uniquely positioned to solve this problem.
Show relevant experience, domain expertise, and any notable achievements.
Keep it confident and specific.`,

  'funding_use': `Write a clear 150-word funding use section.
Break down exactly how the funds will be used with specific amounts.
Connect each use of funds directly to a business outcome or milestone.
Show financial discipline and clear thinking.`,

  'impact': `Write a powerful 200-word impact section.
Quantify expected impact across: jobs created, people served, revenue generated, and SDG alignment.
Show the ripple effect — how impact compounds beyond direct beneficiaries.
End with a bold but credible vision for scale.`
}

function scoreSection(content: string): number {
  let score = 50
  
  // Has numbers/metrics
  if (/\d+/.test(content)) score += 15
  // Has multiple metrics
  if ((content.match(/\d+/g) || []).length > 3) score += 10
  // Reasonable length
  if (content.length > 200) score += 10
  if (content.length > 400) score += 5
  // Has strong action words
  if (/empower|transform|impact|scale|grow|create|build/i.test(content)) score += 5
  // Has African context
  if (/africa|nigeria|ghana|kenya|naira|lagos/i.test(content)) score += 5

  return Math.min(score, 100)
}

export async function POST(request: NextRequest) {
  try {
    const { businessProfile, grantSlug, sectionKey } = await request.json()

    const grantContext = grantPrompts[grantSlug] || grantPrompts['tony-elumelu']
    const sectionContext = sectionPrompts[sectionKey] || sectionPrompts['executive_summary']

    const prompt = `
GRANT CONTEXT:
${grantContext}

BUSINESS INFORMATION:
Business: ${businessProfile.business_name}
Problem they solve: ${businessProfile.problem}
Customers: ${businessProfile.customers}
Country/Region: ${businessProfile.country}
Sector: ${businessProfile.sector}
Stage: ${businessProfile.stage}
Traction: ${businessProfile.traction}
Funding use: ${businessProfile.funding_use}

SECTION TO WRITE:
${sectionContext}

Write ONLY the section content. No headings, no labels, no preamble. Just the section text itself.
Write in first person as the founder. Be specific, use their actual numbers and context.
`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const score = scoreSection(content)

    return NextResponse.json({ content, score })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}