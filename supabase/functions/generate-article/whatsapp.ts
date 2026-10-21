// ==============================================================================
// Green API WhatsApp Notification & Broadcast Service
// Sends published article links to WhatsApp Group with 3-8s random delay
// Alerts OWNER_CHAT_ID for flagged drafts
// ==============================================================================

interface SendMessageOptions {
  chatId: string;
  message: string;
}

/**
 * Raw helper to call Green API sendMessage endpoint
 */
async function callGreenApi(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
  const instanceId = Deno.env.get('GREEN_API_INSTANCE_ID');
  const token = Deno.env.get('GREEN_API_TOKEN');
  const rawBaseUrl = Deno.env.get('GREEN_API_BASE_URL') || 'https://api.green-api.com';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  if (!instanceId || !token) {
    console.warn('Green API credentials not set. Skipping WhatsApp notification.');
    return { success: false, error: 'Credentials not configured' };
  }

  const endpoint = `${baseUrl}/waInstance${instanceId}/sendMessage/${token}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: options.chatId,
        message: options.message,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Green API Error (${res.status}):`, errorText);
      return { success: false, error: errorText };
    }

    await res.json();
    return { success: true };
  } catch (err) {
    console.error('Green API request failed:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Broadcasts published article to WhatsApp Group with random delay (3-8s)
 */
export async function broadcastArticleToWhatsAppGroup(
  title: string,
  summary: string,
  articleUrl: string
): Promise<void> {
  const groupChatId = Deno.env.get('WHATSAPP_GROUP_CHAT_ID');
  if (!groupChatId) {
    console.warn('WHATSAPP_GROUP_CHAT_ID not configured. Skipping group broadcast.');
    return;
  }

  // Random delay between 3 to 8 seconds to emulate natural human publishing
  const delayMs = Math.floor(Math.random() * 5000) + 3000;
  console.log(`Waiting ${delayMs}ms before WhatsApp group broadcast...`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const messageText = `📰 *${title}*

${summary}

🔗 पूरी खबर पढ़ें:
${articleUrl}

_हरियाणा न्यूज़ • haryananews.online_`;

  try {
    const result = await callGreenApi({
      chatId: groupChatId,
      message: messageText,
    });
    if (result.success) {
      console.log('Successfully broadcasted article to WhatsApp Group.');
    } else {
      console.warn('WhatsApp group broadcast failed (non-blocking):', result.error);
    }
  } catch (err) {
    console.error('Failed to broadcast to WhatsApp Group (non-blocking):', err);
  }
}

/**
 * Sends urgent alert to OWNER_CHAT_ID when sensitive topic is held as draft
 */
export async function alertOwnerOnDraftSafety(
  title: string,
  reason: string,
  articleId: string
): Promise<void> {
  const ownerChatId = Deno.env.get('OWNER_CHAT_ID');
  if (!ownerChatId) {
    console.warn('OWNER_CHAT_ID not configured. Cannot send owner draft alert.');
    return;
  }

  const alertText = `🚨 *[हरियाणा न्यूज़ अलर्ट]* संवेदनशील खबर ड्राफ्ट में रखी गई

*शीर्षक:* ${title}
*कारण:* ${reason}
*आर्टिकल ID:* ${articleId}

कृपया एडमिन पैनल (/admin) में जाकर समीक्षा करें और अनुमोदन के पश्चात ही प्रकाशित करें।`;

  try {
    await callGreenApi({
      chatId: ownerChatId,
      message: alertText,
    });
    console.log('Owner notified of held draft via WhatsApp.');
  } catch (err) {
    console.error('Failed to notify owner via WhatsApp (non-blocking):', err);
  }
}
