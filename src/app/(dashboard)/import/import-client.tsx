"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { api } from "@/lib/trpc-client"

export function ImportClient() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle")
  const [validationMessage, setValidationMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const importDebate = api.exports.importDebate.useMutation({
    onSuccess: (result) => {
      router.push(`/debates/${result.debateId}`)
    },
    onError: (err) => {
      setError(err.message || "Failed to import debate")
      setIsImporting(false)
    },
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setSelectedFile(file)
    setError("")
    setValidationStatus("idle")
    setValidationMessage("")

    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.debatr')) {
      setError("Only JSON and .debatr files are supported")
      setValidationStatus("invalid")
      return
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB limit")
      setValidationStatus("invalid")
      return
    }

    // Validate JSON structure
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Basic structure validation
        if (!data.version || !data.debate || !data.participants || !data.messages) {
          throw new Error("Invalid debate export structure")
        }

        setValidationStatus("valid")
        setValidationMessage("Valid debate export detected")
      } catch (err) {
        setValidationStatus("invalid")
        setValidationMessage("Invalid JSON format or structure")
        setError("The file could not be parsed as a valid debate export")
      }
    }
    reader.readAsText(file)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setError("")
    setValidationStatus("idle")
    setValidationMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setError("")

    try {
      const content = await selectedFile.text()
      const data = JSON.parse(content)
      
      await importDebate.mutateAsync({ data })
    } catch (err) {
      setError("Failed to read or parse the file")
      setIsImporting(false)
    }
  }

  return (
    <div className="import-page">
      <div
        className={`dropzone${isDragging ? " dragging" : ""}`}
        id="dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: isDragging ? "var(--muted)" : "var(--card)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload size={32} strokeWidth={1.5} style={{ color: "var(--muted-foreground)" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>
          {selectedFile ? selectedFile.name : "Drop your debate export file here"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          {selectedFile
            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
            : "or click to browse · JSON, .debatr files · Max 25 MB"}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".json,.debatr"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* Validation Status */}
      {validationStatus !== "idle" && (
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: validationStatus === "valid" ? "rgba(26, 174, 57, 0.08)" : "rgba(212, 24, 61, 0.08)",
          border: validationStatus === "valid" ? "1px solid rgba(26, 174, 57, 0.2)" : "1px solid rgba(212, 24, 61, 0.2)",
        }}>
          {validationStatus === "valid" ? (
            <CheckCircle size={18} style={{ color: "var(--notion-accent-teal)" }} />
          ) : (
            <AlertCircle size={18} style={{ color: "var(--destructive)" }} />
          )}
          <span style={{ 
            fontSize: 13, 
            color: validationStatus === "valid" ? "var(--notion-accent-teal)" : "var(--destructive)",
            fontWeight: 500 
          }}>
            {validationMessage}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: "var(--radius-md)",
          background: "rgba(212, 24, 61, 0.08)",
          border: "1px solid rgba(212, 24, 61, 0.2)",
          fontSize: 13,
          color: "var(--destructive)",
        }}>
          {error}
        </div>
      )}

      <div className="form-divider" style={{ margin: "var(--space-xxl) 0" }} />

      <div className="form-actions" style={{ display: "flex", gap: 10 }}>
        <button 
          className="btn btn-primary btn-lg" 
          disabled={!selectedFile || validationStatus !== "valid" || isImporting}
          onClick={handleImport}
          style={{ flex: 1 }}
        >
          {isImporting ? "Importing..." : "Import Debate"}
        </button>
        <button 
          className="btn btn-secondary btn-lg" 
          onClick={handleCancel}
          disabled={isImporting}
        >
          Cancel
        </button>
      </div>

      {/* Import Info */}
      <div style={{ marginTop: 24, padding: "16px", background: "var(--muted)", borderRadius: "var(--radius-md)" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 8 }}>
          ABOUT IMPORTS
        </div>
        <ul style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.6, paddingLeft: 20 }}>
          <li>Imported debates are created as new completed debates for reference</li>
          <li>Original debate metadata and transcript are preserved</li>
          <li>Judge reports and evidence are included when available</li>
          <li>Private lawyer logs are not imported by default</li>
          <li>Use imported debates as reference material in new debates</li>
        </ul>
      </div>
    </div>
  )
}