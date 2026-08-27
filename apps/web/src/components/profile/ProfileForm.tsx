import { useState } from 'react'
import type { Profile, UpdateProfileRequest } from '@jobmatch/shared'
import styles from './ProfileForm.module.css'

type FormValues = Pick<Profile, 'name' | 'headline' | 'email' | 'phone' | 'location'>

/**
 * Keyed by the parent on the same fields (see routes/profile.tsx) so a
 * successful save (which refetches `profile` via router.invalidate())
 * remounts this component with fresh initial state, instead of
 * synchronizing local state to a prop change via an effect.
 */
export function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile
  onSave: (patch: UpdateProfileRequest) => Promise<void>
}) {
  const [form, setForm] = useState<FormValues>(profile)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setJustSaved(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      setJustSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2>Personal details</h2>
      <div className={styles.grid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="name">Full name</label>
          <input id="name" value={form.name} onChange={handleChange('name')} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="headline">Headline</label>
          <input id="headline" value={form.headline} onChange={handleChange('headline')} />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={handleChange('email')} />
        </div>
        <div className={styles.field}>
          <label htmlFor="phone">Phone</label>
          <input id="phone" value={form.phone} onChange={handleChange('phone')} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="location">Location</label>
          <input id="location" value={form.location} onChange={handleChange('location')} />
        </div>
      </div>
      <div className={styles.footer}>
        <button type="submit" className={styles.saveButton} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {justSaved && <span className={styles.savedNote}>Saved</span>}
      </div>
    </form>
  )
}
