#!/bin/bash

echo "🔧 Setting up Redis Cloud for local development..."
echo ""

echo "📋 Instructions:"
echo "1. Go to your Redis Cloud dashboard"
echo "2. Find your database connection details"
echo "3. Copy the connection string"
echo ""

echo "🔗 Your current Redis Cloud endpoint:"
echo "   redis-19105.c53.west-us.azure.redns.redis-cloud.com"
echo ""

echo "📝 Update your .env.local file with:"
echo "REDIS_URL=redis://username:password@redis-19105.c53.west-us.azure.redns.redis-cloud.com:6379"
echo ""

echo "💡 Tips:"
echo "- Replace 'username' and 'password' with your actual Redis Cloud credentials"
echo "- The connection string format is: redis://username:password@hostname:port"
echo "- Make sure to use the correct port (usually 6379 for Redis Cloud)"
echo ""

echo "🔄 After updating .env.local, restart your Next.js development server:"
echo "   npm run dev"
echo ""

echo "✅ Test the connection with:"
echo "   node test-redis.js"
