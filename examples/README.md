# Example Configuration Files

This directory contains example configurations for deploying the 360 Magicians Agent Development Kit.

## Files

- `example.env` - Environment variables template
- `docker-compose.example.yml` - Docker Compose configuration
- `kubernetes-example.yml` - Kubernetes deployment configuration
- `agent-config.example.json` - Agent configuration template

## Usage

1. Copy the example files and remove the `.example` extension
2. Fill in your specific values (API keys, endpoints, etc.)
3. Deploy using your preferred method

```bash
# For Docker
cp docker-compose.example.yml docker-compose.yml
# Edit docker-compose.yml with your values
docker-compose up -d

# For Kubernetes
cp kubernetes-example.yml deployment.yml
# Edit deployment.yml with your values
kubectl apply -f deployment.yml
```

## Security Note

⚠️ **Never commit files containing API keys or secrets to version control!**

Add these to your `.gitignore`:
```
.env
docker-compose.yml
deployment.yml
*-config.json
```
