import { ImportClient } from "./import-client"

export default async function ImportPage() {
  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Import Debate</h1>
        <p>Upload an existing debate to continue working with it inside Debatr.</p>
      </div>
      <div className="card">
        <ImportClient />
      </div>
    </main>
  )
}

