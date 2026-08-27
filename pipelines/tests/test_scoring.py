"""Sanity checks for the deterministic scoring pipeline.

Run from repo root: npm run pipelines:test
(python3 -m unittest discover -s pipelines/tests -t .)
"""

import unittest

from pipelines.data.cv_raw import CV_TEXT
from pipelines.data.job_postings import JOB_POSTINGS
from pipelines.matching.parse_cv import parse_cv
from pipelines.matching.scoring import score_job


class TestScoring(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.profile = parse_cv(CV_TEXT)
        cls.jobs_by_id = {job["id"]: job for job in JOB_POSTINGS}

    def test_cv_parses_expected_shape(self) -> None:
        self.assertEqual(self.profile["name"], "John Doe")
        self.assertIn("john.doe@example.com", self.profile["email"])
        self.assertEqual(len(self.profile["education"]), 2)
        self.assertEqual(len(self.profile["experience"]), 3)
        self.assertGreater(len(self.profile["skills"]), 5)

    def test_ai_role_outscores_noise_role(self) -> None:
        ai_job = self.jobs_by_id["job-001"]  # Senior AI Engineer
        noise_job = self.jobs_by_id["job-018"]  # Administrative Coordinator

        ai_score = score_job(self.profile, ai_job)
        noise_score = score_job(self.profile, noise_job)

        self.assertGreater(ai_score.total, noise_score.total)
        self.assertGreater(ai_score.total, 0.5)
        self.assertLess(noise_score.total, 0.3)

    def test_scores_are_bounded(self) -> None:
        for job in JOB_POSTINGS:
            result = score_job(self.profile, job)
            self.assertGreaterEqual(result.total, 0.0)
            self.assertLessEqual(result.total, 1.0)


if __name__ == "__main__":
    unittest.main()
