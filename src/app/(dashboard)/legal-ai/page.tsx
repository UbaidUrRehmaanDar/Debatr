import { LegalAIClient } from "./legal-ai-client"

export default function LegalAIPage() {
  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Legal AI</h1>
        <p>Leverage AI to draft and review legal documents within Debatr.</p>
      </div>
      <div className="card">
        <LegalAIClient />
      </div>
    </main>
  )
}

