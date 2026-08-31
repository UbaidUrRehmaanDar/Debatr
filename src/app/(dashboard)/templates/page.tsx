import { auth } from "@/server/auth"
import { TemplatesClient } from "./templates-client"

// Static page - templates don't change often
export const revalidate = 3600 // 1 hour

export default async function TemplatesPage() {
  const session = await auth()

  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Templates</h1>
        <p>Browse and use pre‑built debate templates to kickstart your discussions.</p>
      </div>
      <div className="card">
        <TemplatesClient />
      </div>
    </main>
  )
}
