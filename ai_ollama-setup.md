# Ollama — Quick Setup & Integration Notes

Why Ollama?
- Local, privacy-friendly LLM hosting with an HTTP API (no cloud API keys).
- Good for private RAG, fast iteration, control of models and versions.
- Works well on Ubuntu; Windows via native or WSL2.

Install (Ubuntu)
1. Official install (check latest on Ollama site):
   - curl https://ollama.ai/install.sh | sh
2. Verify:
   - ollama list
   - ollama run <model> --name test

Install (Windows)
- Preferred: WSL2 + Ubuntu in WSL then install Ollama in WSL.
- Alternatively use Ollama's Windows binary if available for your platform.

Start Ollama (basic)
- Start server (Ollama runs its own server on default ports). Example usage:
  - ollama pull llama2  # pulls a model
  - ollama run llama2 --name llama-local

API usage
- Ollama exposes a local API (check `ollama api` or client SDK). Example curl:
  - curl -X POST "http://localhost:11434/v1/response" -H "Content-Type: application/json" -d '{"model":"llama2","prompt":"Hello"}'

LangChain / Python
- Use Ollama's LLM wrapper (if provided) or a simple HTTP wrapper:
  - from langchain import LLM
  - Implement a custom LLM class that posts to the Ollama endpoint.

Dev vs Prod models
- Dev: small-medium models (faster; run on CPU or small GPU).
- Prod: larger models (GPU) or cloud-based LLMs for scale (OpenAI, Anthropic).

Caveats & tips
- Local models require significant disk and memory for larger sizes.
- Keep an eye on latency; use caching for repeated prompts.
- Use a gateway service that handles model selection and rate-limits calls from downstream agents.

Security
- Expose Ollama only on internal network or localhost; do not expose to public internet without auth.
- Use nginx to restrict access to Ollama endpoints and apply rate limits.