import { useRef, useState } from 'react'
import type { Cv, CvParsePreviewResponse, UpdateProfileRequest } from '@jobmatch/shared'
import { apiClient } from '../../lib/apiClient'
import styles from './CvUploadCard.module.css'

export function CvUploadCard({
  cv,
  onApplyExtracted,
}: {
  cv: Cv
  onApplyExtracted: (patch: UpdateProfileRequest) => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<CvParsePreviewResponse['extracted'] | null>(null)
  const [parsing, setParsing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setParsing(true)
    try {
      const rawText = await file.text()
      const { extracted } = await apiClient.parseCvPreview(rawText)
      setPreview(extracted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV.')
    } finally {
      setParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleApply() {
    if (!preview) return
    setApplying(true)
    try {
      await onApplyExtracted(preview)
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply extracted fields.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <section className={styles.card}>
      <h2>CV</h2>

      <div className={styles.current}>
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>📄</span>
          <div>
            <div className={styles.fileName}>{cv.fileName}</div>
            <div className={styles.uploadedAt}>Uploaded {new Date(cv.uploadedAt).toLocaleDateString()}</div>
          </div>
        </div>

        <label className={styles.reuploadLabel}>
          {parsing ? 'Parsing…' : 'Re-upload CV'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            className={styles.hiddenInput}
            onChange={handleFileSelected}
            disabled={parsing}
          />
        </label>
      </div>

      <p className={styles.hint}>
        Upload a plain-text CV to preview what our deterministic parser extracts, then apply it to your profile.
        (Demo accepts .txt files; a production version would extract text from PDF/DOCX first.)
      </p>

      {error && <p className={styles.error}>{error}</p>}

      {preview && (
        <div className={styles.preview}>
          <h3>Extracted from your CV — review before applying</h3>
          <dl className={styles.previewGrid}>
            <div className={styles.previewRow}>
              <dt>Name</dt>
              <dd>{preview.name ?? '—'}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Headline</dt>
              <dd>{preview.headline ?? '—'}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Email</dt>
              <dd>{preview.email || '—'}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Location</dt>
              <dd>{preview.location || '—'}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Education entries</dt>
              <dd>{preview.education?.length ?? 0}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Experience entries</dt>
              <dd>{preview.experience?.length ?? 0}</dd>
            </div>
            <div className={styles.previewRow}>
              <dt>Skills</dt>
              <dd>{preview.skills?.length ?? 0}</dd>
            </div>
          </dl>
          <div className={styles.previewActions}>
            <button className={styles.applyButton} onClick={handleApply} disabled={applying}>
              {applying ? 'Applying…' : 'Apply to profile'}
            </button>
            <button className={styles.discardButton} onClick={() => setPreview(null)} disabled={applying}>
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
