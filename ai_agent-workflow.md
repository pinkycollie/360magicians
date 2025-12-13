# Agent Workflow — MBTQ

Overview
This document describes an agent-based workflow for your MBTQ setup:
- Repos: DeafAUTH, PinkSync, Fibonrose, Pinkflow (plus frontend/backend)
- Inbox: C:\zipped-inbox on a Windows host (also accessible from D: or Ubuntu host)
- Infrastructure: nginx reverse-proxy, Docker / Kubernetes, Ubuntu host(s), Windows PowerShell
- LLM Host: optional Ollama (local model server), or cloud LLMs

Goals
1. Automate inbox ingestion, classification, and routing to services.
2. Use RAG (Fibonrose vector store) for AI-assisted responses.
3. Use Pinkflow as workflow/orchestration engine for multi-step tasks.
4. Provide admin / dev-friendly local workflows (Windows PowerShell + Ubuntu).
5. Use Ollama or equivalent for private LLM hosting.

Agents (roles & responsibilities)
1. Inbox Ingestion Agent (file-watcher)
   - Platform: Node.js / Python service running on Windows (PowerShell) or Ubuntu.
   - Task: Watch C:\zipped-inbox for new zip files, unzip, extract metadata, validate contents.
   - Output: Post events (HTTP webhook / RabbitMQ) with extracted payload to PinkSync / RabbitMQ.

2. Classifier/Preprocessor Agent
   - Platform: containerized Python/Node using local policy + lightweight LLM.
   - Task: Classify content (type, priority, required accessibility actions), strip PII if needed.
   - Output: Write structured JSON to a staging bucket/DB and push a message to RabbitMQ.

3. RAG Agent (Fibonrose integration)
   - Platform: uses Fibonrose chromadb/cassandra vector store + local LLM.
   - Task: When queries arrive (support queries or internal QA), perform retrieval, generate answers.
   - Integration: LangChain / LlamaIndex -> Fibonrose vector store -> Ollama (or cloud LLM).

4. Identity/Directory Sync Agent (PinkSync)
   - Platform: Node.js (existing PinkSync service)
   - Task: Listen to identity events and propagate updates to downstream services and accessibility nodes.

5. Auth Agent (DeafAUTH)
   - Platform: DeafAUTH service (Next.js / auth routes)
   - Task: Provide JWT signatures and validation endpoints for agents that need authenticated operations.

6. Orchestration Agent (Pinkflow)
   - Platform: Workflow engine (Temporal/Node + Pinkflow)
   - Task: Manage multi-step processes, retries, human approvals, and long-running jobs.

7. Operation & Deploy Agents (Magician-core / CI triggers)
   - Platform: GitHub Actions runners, or local agent runners.
   - Task: Trigger build/deploy pipelines, rollback if health checks fail, update Kubernetes manifests or Docker Compose.

Event & Data Flow (simplified)
1. New ZIP arrives -> Inbox Ingestion Agent unzips -> pushes structured event to RabbitMQ / HTTP webhook.
2. Classifier picks up event -> preprocessed data stored into a staging DB and vector embeddings created -> stored in Fibonrose (vector DB).
3. Pinkflow orchestrates any needed multi-step flows (human approval, DeafAUTH checks).
4. RAG Agent answers queries by retrieving from Fibonrose + calling Ollama / cloud LLM.
5. PinkSync keeps user/profile stores consistent across services; DeafAUTH handles auth for endpoints.
6. Nginx routes all agent HTTP APIs (exposed endpoints) and provides TLS/ratelimiting.

Runtime Options (Dev vs Prod)
- Dev (Windows / Ubuntu local)
  - Run inbox agent as a PowerShell scheduled task or Windows service.
  - Run Ollama on local Ubuntu/WSL if possible (or Windows if supported).
  - Start services with docker-compose, with nginx in front.

- Prod (Docker/Kubernetes)
  - Containerize all agents and use the existing docker-compose / k8s manifests.
  - Use Kubernetes deployments, horizontal autoscaling per agent type.
  - Use nginx ingress + cert-manager for TLS.

Security & Compliance
- DeafAUTH is the authority for JWT tokens; all agents must present valid tokens for sensitive API calls.
- Remove/obfuscate PII during preprocessing if regulatory needs.
- Limit rate for agent endpoints via nginx rate-limiting.
- Use mTLS between internal services in production (K8s / service mesh recommended).

Observability & Monitoring
- Push metrics (Prometheus) and logs (ELK / Loki) from agent containers.
- Health endpoints for each agent (nginx location /health-agent-name).
- Alerting for message queue backpressure, failed ingestion, high LLM latency.

Implementation priorities (first 7 days)
1. Inbox Ingestion Agent (file-watcher + unzip + validation).
2. Staging DB + connector to Fibonrose for embeddings.
3. Simple RAG pipeline calling Ollama (dev model).
4. Nginx route for agent endpoints + auth enforcement via DeafAUTH.
5. Pinkflow skeleton to orchestrate a single workflow.
6. Monitoring & logs basic stack.
7. CI pipeline for agents.

Integration notes for C:\ zipped-inbox
- If Windows host is separate, share via SMB to Ubuntu host OR run ingestion agent on the Windows host and post events to central message bus.
- Use checksums and locking (move file to .processing) to avoid duplicate ingestion.

Examples of technologies & libs
- LangChain or LlamaIndex for RAG
- Ollama / Llama2 / Mistral local models (Ollama recommended for on-prem)
- RabbitMQ / Redis streams for events
- Terraform / Kubernetes for infra
- GitHub Actions + Docker/Buildx for CI