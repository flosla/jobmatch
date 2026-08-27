import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { apiClient } from '../../lib/apiClient'
import { JobDetailPanel } from '../../components/job/JobDetailPanel'
import { Skeleton } from '../../components/shared/Skeleton'

export const Route = createFileRoute('/matches/$jobId')({
  loader: async ({ params }) => {
    try {
      return await apiClient.getMatch(params.jobId)
    } catch {
      throw notFound()
    }
  },
  pendingComponent: JobDetailPending,
  notFoundComponent: JobDetailNotFound,
  component: JobDetailPage,
})

function JobDetailPage() {
  const match = Route.useLoaderData()
  return <JobDetailPanel match={match} />
}

function JobDetailPending() {
  return (
    <main className="page">
      <Skeleton height="420px" />
    </main>
  )
}

function JobDetailNotFound() {
  return (
    <main className="page">
      <div className="pageHeader">
        <h1>Match not found</h1>
        <p>
          This job isn't one of today's top 10 matches (or the link is out of date).{' '}
          <Link to="/matches">Back to matches</Link>
        </p>
      </div>
    </main>
  )
}
