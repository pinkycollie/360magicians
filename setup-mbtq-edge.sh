#!/bin/bash
# setup-mbtq-edge.sh - Initialize MBTQ Fresh 2.0 Edge Functions

set -e

echo "🚀 Setting up MBTQ Edge Functions Infrastructure..."
echo ""

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install Deno first:"
    echo "   curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

echo "✅ Deno $(deno --version | head -n1) detected"
echo ""

# Create main project directory structure (already exists in repo)
echo "📁 Verifying directory structure..."
mkdir -p edge-functions/{api,auth,ai,sync,fibonrose,monitor}
mkdir -p shared/{middleware,utils,types}
echo "✅ Directory structure verified"
echo ""

# Initialize Fresh 2.0 for each service (optional - for full Fresh setup)
echo "🎯 Edge functions are ready to use!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy .env.example to .env and configure your environment variables"
echo "   2. Run 'deno task dev' to start the API Gateway locally"
echo "   3. Run './deploy.sh' to deploy to Deno Deploy"
echo ""
echo "🔧 Available development commands:"
echo "   deno task dev           - Start API Gateway"
echo "   deno task dev:auth      - Start DeafAUTH service"
echo "   deno task dev:ai        - Start AI Router"
echo "   deno task dev:sync      - Start PinkSync"
echo "   deno task dev:fibonrose - Start Fibonrose"
echo "   deno task dev:monitor   - Start Monitor"
echo ""
echo "✅ Setup complete! Ready to deploy to edge.mbtq.dev 🚀"
