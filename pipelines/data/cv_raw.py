"""John Doe's CV as raw, section-delimited plain text.

This mimics what a real CV-to-text extraction step (e.g. a PDF/DOCX text
extractor) would hand off to the parsing stage. Sections are delimited by
ALL-CAPS headers followed by a colon, which pipelines/matching/parse_cv.py
splits on.
"""

CV_TEXT = """\
John Doe
Senior AI Engineer
Austin, TX (Remote-friendly) | john.doe@example.com | +1 (512) 555-0142
linkedin.com/in/johndoe-ai | github.com/johndoe-ai

SUMMARY:
AI/ML engineer with 5 years of experience building and shipping large language
model applications, retrieval-augmented generation systems, and production
MLOps pipelines. Comfortable owning a project from data to deployment.

EDUCATION:
M.S. Computer Science (Machine Learning concentration), University of Texas at Austin, 2018-2020
B.S. Computer Science, Iowa State University, 2014-2018

EXPERIENCE:
Senior AI Engineer, Northwind Analytics, Austin, TX, 2023-02 to Present
- Designed and shipped a retrieval-augmented generation (RAG) system over internal enterprise documents, cutting support ticket resolution time by 30%.
- Fine-tuned open-weight LLMs (LoRA/PEFT) for domain-specific summarization and classification tasks.
- Owned MLOps for the team: containerized model services with Docker and Kubernetes, built CI/CD pipelines with GitHub Actions.
- Mentored two junior engineers on prompt engineering and evaluation practices.

Machine Learning Engineer, Cascade Robotics, Austin, TX, 2021-07 to 2023-01
- Built computer-vision models (PyTorch) for warehouse robotics object detection and bin-picking.
- Optimized models for edge deployment, reducing inference latency by 40% on embedded hardware.
- Collaborated with hardware team to integrate perception models into the robot control stack.

Data Scientist, Fieldstone Insurance Group, Des Moines, IA, 2020-06 to 2021-06
- Built predictive risk-scoring models for underwriting using scikit-learn and SQL-based feature pipelines.
- Applied early NLP techniques to extract structured signals from unstructured insurance claims text.
- Presented model performance and business impact to non-technical stakeholders.

SKILLS:
Python, PyTorch, TensorFlow, scikit-learn, LLM fine-tuning (LoRA/PEFT), Retrieval-Augmented Generation (RAG),
LangChain, Prompt Engineering, Vector Databases (FAISS, pgvector), MLOps, Docker, Kubernetes, GitHub Actions,
AWS (SageMaker, S3, Lambda), Azure fundamentals, SQL, Computer Vision, REST API Design
"""
