import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { UpdateProfileRequest } from '@jobmatch/shared'
import { apiClient } from '../lib/apiClient'
import { ProfileForm } from '../components/profile/ProfileForm'
import { CvUploadCard } from '../components/profile/CvUploadCard'
import { ExperienceTimeline } from '../components/profile/ExperienceTimeline'
import { EducationList } from '../components/profile/EducationList'
import { SkillsChips } from '../components/profile/SkillsChips'
import { Skeleton } from '../components/shared/Skeleton'

export const Route = createFileRoute('/profile')({
  loader: () => apiClient.getProfile(),
  pendingComponent: ProfilePending,
  component: ProfilePage,
})

function ProfilePage() {
  const profile = Route.useLoaderData()
  const router = useRouter()

  async function handleUpdate(patch: UpdateProfileRequest) {
    await apiClient.updateProfile(patch)
    await router.invalidate()
  }

  return (
    <main className="page">
      <div className="pageHeader">
        <h1>Your profile</h1>
        <p>Personal details and CV used to compute your daily job matches.</p>
      </div>

      <ProfileForm
        key={`${profile.name}|${profile.headline}|${profile.email}|${profile.phone}|${profile.location}`}
        profile={profile}
        onSave={handleUpdate}
      />
      <CvUploadCard cv={profile.cv} onApplyExtracted={handleUpdate} />
      <ExperienceTimeline experience={profile.experience} />
      <EducationList education={profile.education} />
      <SkillsChips skills={profile.skills} />
    </main>
  )
}

function ProfilePending() {
  return (
    <main className="page">
      <div className="pageHeader">
        <h1>Your profile</h1>
      </div>
      <Skeleton height="220px" />
    </main>
  )
}
