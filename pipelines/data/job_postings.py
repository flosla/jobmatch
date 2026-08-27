"""Demo job postings dataset.

~20 fictional postings at fictional companies, spanning strong AI/ML
matches, medium/partial matches, and clear noise, so the top-10 ranking
produced by matching/scoring.py is meaningfully differentiated. All
companies and apply URLs are fictional (*.example.com).
"""

JOB_POSTINGS = [
    # --- Strong matches -----------------------------------------------
    {
        "id": "job-001",
        "title": "Senior AI Engineer",
        "company": "Vertex Cognition Labs",
        "location": "Austin, TX",
        "workplaceType": "hybrid",
        "seniority": "senior",
        "employmentType": "full_time",
        "postedDate": "2026-08-20",
        "description": (
            "Vertex Cognition Labs is looking for a Senior AI Engineer to lead development "
            "of our retrieval-augmented generation platform, used by enterprise customers to "
            "search and reason over millions of internal documents."
        ),
        "requirements": [
            "5+ years building production ML/AI systems",
            "Hands-on experience with LLM fine-tuning and RAG architectures",
            "Strong Python engineering skills",
        ],
        "niceToHave": ["Experience mentoring junior engineers", "Kubernetes experience"],
        "skillsRequired": [
            "Python", "PyTorch", "LLM fine-tuning (LoRA/PEFT)",
            "Retrieval-Augmented Generation (RAG)", "LangChain", "Docker", "Kubernetes",
        ],
        "salaryRange": {"min": 160000, "max": 195000, "currency": "USD"},
        "applyUrl": "https://careers.vertex-cognition.example.com/jobs/senior-ai-engineer",
    },
    {
        "id": "job-002",
        "title": "LLM Engineer",
        "company": "Meridian AI",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-22",
        "description": (
            "Join Meridian AI's applied research team building and fine-tuning large language "
            "models for enterprise summarization and classification products."
        ),
        "requirements": [
            "3+ years of experience fine-tuning or deploying LLMs",
            "Experience with PEFT/LoRA methods",
            "Comfortable working in a fast-moving, research-adjacent environment",
        ],
        "niceToHave": ["Published research or open-source LLM contributions"],
        "skillsRequired": [
            "Python", "LLM fine-tuning (LoRA/PEFT)", "Prompt Engineering",
            "PyTorch", "Vector Databases (FAISS, pgvector)",
        ],
        "salaryRange": {"min": 145000, "max": 175000, "currency": "USD"},
        "applyUrl": "https://careers.meridian-ai.example.com/jobs/llm-engineer",
    },
    {
        "id": "job-003",
        "title": "ML Engineer, Applied NLP",
        "company": "Cobalt Data Systems",
        "location": "Austin, TX",
        "workplaceType": "hybrid",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-18",
        "description": (
            "Cobalt Data Systems is hiring an ML Engineer to build NLP pipelines that extract "
            "structured signals from unstructured enterprise text at scale."
        ),
        "requirements": [
            "Experience building NLP/text-processing pipelines in production",
            "Strong Python and SQL skills",
            "Experience with vector search or embedding-based retrieval",
        ],
        "niceToHave": ["Experience with LangChain or similar orchestration frameworks"],
        "skillsRequired": ["Python", "SQL", "Vector Databases (FAISS, pgvector)", "LangChain"],
        "salaryRange": {"min": 135000, "max": 165000, "currency": "USD"},
        "applyUrl": "https://careers.cobalt-data.example.com/jobs/ml-engineer-nlp",
    },
    {
        "id": "job-004",
        "title": "AI Platform Engineer",
        "company": "Northstar Robotics",
        "location": "Austin, TX",
        "workplaceType": "onsite",
        "seniority": "senior",
        "employmentType": "full_time",
        "postedDate": "2026-08-15",
        "description": (
            "Northstar Robotics needs a Senior AI Platform Engineer to own the MLOps "
            "infrastructure powering our perception and language model services."
        ),
        "requirements": [
            "5+ years of MLOps or ML infrastructure experience",
            "Experience with Docker and Kubernetes in production",
            "Experience deploying PyTorch models at scale",
        ],
        "niceToHave": ["Robotics or embedded ML experience", "CI/CD pipeline design"],
        "skillsRequired": ["Python", "PyTorch", "MLOps", "Docker", "Kubernetes", "GitHub Actions"],
        "salaryRange": {"min": 165000, "max": 200000, "currency": "USD"},
        "applyUrl": "https://careers.northstar-robotics.example.com/jobs/ai-platform-engineer",
    },
    {
        "id": "job-005",
        "title": "Generative AI Engineer",
        "company": "Lighthouse Cognitive",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-23",
        "description": (
            "Lighthouse Cognitive builds generative AI copilots for knowledge workers. We're "
            "looking for an engineer to design prompt strategies and RAG pipelines for our core product."
        ),
        "requirements": [
            "3+ years building applied generative AI systems",
            "Strong grasp of prompt engineering and evaluation methodology",
            "Experience with RAG architectures",
        ],
        "niceToHave": ["Experience with agentic/tool-use LLM systems"],
        "skillsRequired": [
            "Python", "Prompt Engineering", "Retrieval-Augmented Generation (RAG)",
            "LangChain", "Vector Databases (FAISS, pgvector)",
        ],
        "salaryRange": {"min": 150000, "max": 180000, "currency": "USD"},
        "applyUrl": "https://careers.lighthouse-cognitive.example.com/jobs/generative-ai-engineer",
    },
    {
        "id": "job-006",
        "title": "ML Engineer, Conversational AI",
        "company": "Solara Systems",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-19",
        "description": (
            "Solara Systems is expanding our conversational AI team. You'll build and evaluate "
            "LLM-backed dialogue systems used by thousands of customer support teams."
        ),
        "requirements": [
            "3+ years of applied ML/NLP experience",
            "Experience fine-tuning or prompting LLMs for dialogue tasks",
            "Comfortable owning a service end-to-end in production",
        ],
        "niceToHave": ["Experience with AWS SageMaker"],
        "skillsRequired": [
            "Python", "LLM fine-tuning (LoRA/PEFT)", "Prompt Engineering",
            "AWS (SageMaker, S3, Lambda)",
        ],
        "salaryRange": {"min": 140000, "max": 170000, "currency": "USD"},
        "applyUrl": "https://careers.solara-systems.example.com/jobs/ml-engineer-conversational-ai",
    },
    # --- Medium / partial matches ---------------------------------------
    {
        "id": "job-007",
        "title": "Data Scientist, ML",
        "company": "Fieldstone Insurance Group",
        "location": "Des Moines, IA",
        "workplaceType": "hybrid",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-10",
        "description": (
            "Fieldstone Insurance Group is hiring a Data Scientist to extend our risk-scoring "
            "models and bring modern ML tooling to our underwriting pipeline."
        ),
        "requirements": [
            "2+ years of applied data science experience",
            "Strong SQL and Python skills",
            "Experience with scikit-learn or similar tooling",
        ],
        "niceToHave": ["Insurance or financial services background", "NLP experience"],
        "skillsRequired": ["Python", "SQL", "scikit-learn"],
        "salaryRange": {"min": 105000, "max": 130000, "currency": "USD"},
        "applyUrl": "https://careers.fieldstone-insurance.example.com/jobs/data-scientist-ml",
    },
    {
        "id": "job-008",
        "title": "Computer Vision Engineer",
        "company": "Cascade Robotics",
        "location": "Austin, TX",
        "workplaceType": "onsite",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-12",
        "description": (
            "Cascade Robotics is looking for a Computer Vision Engineer to extend our "
            "warehouse-robotics perception stack with new object classes and faster models."
        ),
        "requirements": [
            "2+ years of computer vision experience with PyTorch or TensorFlow",
            "Experience deploying models to embedded/edge hardware",
        ],
        "niceToHave": ["Robotics industry experience"],
        "skillsRequired": ["Python", "PyTorch", "Computer Vision"],
        "salaryRange": {"min": 120000, "max": 150000, "currency": "USD"},
        "applyUrl": "https://careers.cascade-robotics.example.com/jobs/computer-vision-engineer",
    },
    {
        "id": "job-009",
        "title": "Backend Engineer (Python)",
        "company": "Ironclad Fintech",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-14",
        "description": (
            "Ironclad Fintech needs a Backend Engineer to build reliable, well-tested Python "
            "services powering our payments infrastructure."
        ),
        "requirements": [
            "3+ years of backend engineering experience",
            "Strong Python and REST API design skills",
            "Experience with SQL databases",
        ],
        "niceToHave": ["Experience with Docker and CI/CD"],
        "skillsRequired": ["Python", "REST API Design", "SQL", "Docker"],
        "salaryRange": {"min": 130000, "max": 160000, "currency": "USD"},
        "applyUrl": "https://careers.ironclad-fintech.example.com/jobs/backend-engineer-python",
    },
    {
        "id": "job-010",
        "title": "Data Engineer",
        "company": "Prairie Analytics",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-09",
        "description": (
            "Prairie Analytics is hiring a Data Engineer to build and maintain the pipelines "
            "that feed our analytics and ML platform."
        ),
        "requirements": [
            "3+ years of data engineering experience",
            "Strong SQL skills and experience with Python-based ETL",
        ],
        "niceToHave": ["Experience with AWS data services"],
        "skillsRequired": ["Python", "SQL", "AWS (SageMaker, S3, Lambda)"],
        "salaryRange": {"min": 125000, "max": 155000, "currency": "USD"},
        "applyUrl": "https://careers.prairie-analytics.example.com/jobs/data-engineer",
    },
    {
        "id": "job-011",
        "title": "Junior ML Engineer",
        "company": "Bramble AI",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "junior",
        "employmentType": "full_time",
        "postedDate": "2026-08-21",
        "description": (
            "Bramble AI is looking for a Junior ML Engineer to join our small applied ML team "
            "working on classification and recommendation models."
        ),
        "requirements": [
            "0-2 years of ML engineering experience",
            "Solid foundations in Python and PyTorch or TensorFlow",
        ],
        "niceToHave": ["Personal or academic ML projects"],
        "skillsRequired": ["Python", "PyTorch", "scikit-learn"],
        "salaryRange": {"min": 90000, "max": 110000, "currency": "USD"},
        "applyUrl": "https://careers.bramble-ai.example.com/jobs/junior-ml-engineer",
    },
    {
        "id": "job-012",
        "title": "MLOps Engineer",
        "company": "Foundry Cloud Systems",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-11",
        "description": (
            "Foundry Cloud Systems is hiring an MLOps Engineer to build the CI/CD and "
            "deployment tooling our ML teams rely on."
        ),
        "requirements": [
            "2+ years of MLOps or DevOps experience",
            "Experience with Docker and Kubernetes",
            "Experience with CI/CD pipelines",
        ],
        "niceToHave": ["Experience deploying LLM-based services"],
        "skillsRequired": ["Docker", "Kubernetes", "GitHub Actions", "Python"],
        "salaryRange": {"min": 130000, "max": 160000, "currency": "USD"},
        "applyUrl": "https://careers.foundry-cloud.example.com/jobs/mlops-engineer",
    },
    # --- Weak / noise matches --------------------------------------------
    {
        "id": "job-013",
        "title": "Frontend Engineer (React)",
        "company": "Bright Path Media",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-08",
        "description": "Bright Path Media is looking for a Frontend Engineer to build our React-based content platform.",
        "requirements": ["3+ years of React experience", "Strong CSS and TypeScript skills"],
        "niceToHave": ["Design systems experience"],
        "skillsRequired": ["TypeScript", "React", "CSS"],
        "salaryRange": {"min": 110000, "max": 140000, "currency": "USD"},
        "applyUrl": "https://careers.brightpath-media.example.com/jobs/frontend-engineer",
    },
    {
        "id": "job-014",
        "title": "Product Manager, AI Products",
        "company": "Vertex Cognition Labs",
        "location": "Austin, TX",
        "workplaceType": "hybrid",
        "seniority": "senior",
        "employmentType": "full_time",
        "postedDate": "2026-08-17",
        "description": "Vertex Cognition Labs needs a Senior PM to own the roadmap for our enterprise RAG product.",
        "requirements": ["5+ years of B2B SaaS product management", "Experience shipping AI-powered products"],
        "niceToHave": ["Technical background in ML"],
        "skillsRequired": ["Product Strategy", "Roadmapping", "Stakeholder Management"],
        "salaryRange": {"min": 150000, "max": 180000, "currency": "USD"},
        "applyUrl": "https://careers.vertex-cognition.example.com/jobs/product-manager-ai",
    },
    {
        "id": "job-015",
        "title": "DevOps Engineer",
        "company": "Stonegate Systems",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-07",
        "description": "Stonegate Systems is hiring a DevOps Engineer to manage our cloud infrastructure and release pipelines.",
        "requirements": ["3+ years of DevOps experience", "Experience with Terraform and AWS"],
        "niceToHave": ["Kubernetes experience"],
        "skillsRequired": ["AWS (SageMaker, S3, Lambda)", "Terraform", "Docker"],
        "salaryRange": {"min": 120000, "max": 150000, "currency": "USD"},
        "applyUrl": "https://careers.stonegate-systems.example.com/jobs/devops-engineer",
    },
    {
        "id": "job-016",
        "title": "Sales Engineer, Data Platform",
        "company": "Cobalt Data Systems",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-06",
        "description": "Cobalt Data Systems is looking for a Sales Engineer to support technical pre-sales for our data platform.",
        "requirements": ["3+ years in a sales engineering or solutions architect role", "Strong SQL knowledge"],
        "niceToHave": ["Experience presenting to enterprise customers"],
        "skillsRequired": ["SQL", "Solution Design", "Presentation Skills"],
        "salaryRange": {"min": 115000, "max": 150000, "currency": "USD"},
        "applyUrl": "https://careers.cobalt-data.example.com/jobs/sales-engineer",
    },
    {
        "id": "job-017",
        "title": "UX Designer",
        "company": "Meridian AI",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-05",
        "description": "Meridian AI needs a UX Designer to design intuitive interfaces for our AI copilot products.",
        "requirements": ["3+ years of product design experience", "Strong portfolio of shipped design work"],
        "niceToHave": ["Experience designing AI/chat interfaces"],
        "skillsRequired": ["Figma", "Interaction Design", "User Research"],
        "salaryRange": {"min": 110000, "max": 140000, "currency": "USD"},
        "applyUrl": "https://careers.meridian-ai.example.com/jobs/ux-designer",
    },
    {
        "id": "job-018",
        "title": "Administrative Coordinator",
        "company": "Prairie Analytics",
        "location": "Des Moines, IA",
        "workplaceType": "onsite",
        "seniority": "junior",
        "employmentType": "full_time",
        "postedDate": "2026-08-04",
        "description": "Prairie Analytics is hiring an Administrative Coordinator to support day-to-day office operations.",
        "requirements": ["1+ years of administrative experience", "Strong organizational skills"],
        "niceToHave": ["Experience with scheduling software"],
        "skillsRequired": ["Scheduling", "Office Administration", "Communication"],
        "salaryRange": {"min": 45000, "max": 55000, "currency": "USD"},
        "applyUrl": "https://careers.prairie-analytics.example.com/jobs/administrative-coordinator",
    },
    {
        "id": "job-019",
        "title": "QA Automation Engineer",
        "company": "Ironclad Fintech",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "mid",
        "employmentType": "full_time",
        "postedDate": "2026-08-03",
        "description": "Ironclad Fintech is looking for a QA Automation Engineer to build automated test suites for our payments platform.",
        "requirements": ["2+ years of test automation experience", "Experience with Python-based testing frameworks"],
        "niceToHave": ["Experience testing financial systems"],
        "skillsRequired": ["Python", "Test Automation", "CI/CD"],
        "salaryRange": {"min": 100000, "max": 125000, "currency": "USD"},
        "applyUrl": "https://careers.ironclad-fintech.example.com/jobs/qa-automation-engineer",
    },
    {
        "id": "job-020",
        "title": "Marketing Analyst",
        "company": "Solara Systems",
        "location": "Remote (US)",
        "workplaceType": "remote",
        "seniority": "junior",
        "employmentType": "full_time",
        "postedDate": "2026-08-02",
        "description": "Solara Systems needs a Marketing Analyst to track campaign performance and build reporting dashboards.",
        "requirements": ["1+ years of marketing analytics experience", "Comfortable with spreadsheets and BI tools"],
        "niceToHave": ["SQL experience"],
        "skillsRequired": ["Marketing Analytics", "Excel", "Reporting"],
        "salaryRange": {"min": 65000, "max": 85000, "currency": "USD"},
        "applyUrl": "https://careers.solara-systems.example.com/jobs/marketing-analyst",
    },
]
