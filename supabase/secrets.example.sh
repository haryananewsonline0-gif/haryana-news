#!/bin/bash
# ==============================================================================
# Supabase Edge Functions Secrets Configuration
# Run these commands in your terminal after logging in with `npx supabase login`
# and linking your project with `npx supabase link --project-ref <your-project-ref>`
# ==============================================================================

# Set all private secrets for Supabase Edge Functions in one command:
npx supabase secrets set \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" \
  GEMINI_API_KEY="your-google-gemini-api-key" \
  GEMINI_MODEL="gemini-2.5-flash" \
  IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key" \
  IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key" \
  IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-endpoint" \
  GREEN_API_INSTANCE_ID="your-green-api-instance-id" \
  GREEN_API_TOKEN="your-green-api-token" \
  GREEN_API_BASE_URL="https://api.green-api.com" \
  WHATSAPP_GROUP_CHAT_ID="120363xxxxxx@g.us" \
  OWNER_CHAT_ID="9198xxxxxx@c.us" \
  CRICAPI_KEY="your-cricapi-key" \
  DATA_GOV_API_KEY="your-data-gov-in-api-key" \
  DATA_GOV_RESOURCE_ID="your-data-gov-resource-id" \
  CRON_SECRET="your-high-entropy-random-cron-secret" \
  ADMIN_EMAIL="admin@haryananews.online" \
  SITE_URL="https://haryananews.online" \
  TURNSTILE_SECRET_KEY="your-cloudflare-turnstile-secret-key"

echo "Supabase Edge Functions secrets configured successfully!"
