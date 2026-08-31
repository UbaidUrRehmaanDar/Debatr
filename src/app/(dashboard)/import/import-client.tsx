"use client"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"

export function ImportClient() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
      >
        <div className="dropzone-icon">
          <Upload size={28} strokeWidth={1.5} />
        </div>
        <div className="dropzone-text">
          <span className="dropzone-title">
            {selectedFile ? selectedFile.name : "Drop your file here"}
          </span>
          <span className="dropzone-subtitle">
            {selectedFile
              ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
              : "or click to browse · JSON, PDF, .debatr · Max 25 MB"
            }
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".json,.pdf,.debatr"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      <div className="form-divider" style={{ margin: "var(--space-xxl) 0" }} />

      <div className="form-actions">
        <button className="btn btn-primary btn-lg" disabled={!selectedFile}>
          Import Debate
        </button>
        <button className="btn btn-secondary btn-lg" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
