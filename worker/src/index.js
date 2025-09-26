export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) })
    }

    if (url.pathname === '/health') {
      return json({ ok: true })
    }

    if (url.pathname === '/api/push/test' && request.method === 'POST') {
      return json({ sent: true })
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env)
    }

    if (url.pathname === '/api/vision' && request.method === 'POST') {
      return handleVision(request, env)
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders(request) })
  },
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'content-type': 'application/json',
  }
}

function json(data, init) {
  const body = typeof data === 'string' ? data : JSON.stringify(data)
  return new Response(body, { ...(init || {}), headers: { ...(init?.headers || {}), 'content-type': 'application/json' } })
}

async function handleChat(request, env) {
  const headers = corsHeaders(request)
  try {
    const { messages, system, temperature } = await request.json()
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400, headers })
    }
    const payload = {
      model: 'gpt-5-nano',
      temperature: typeof temperature === 'number' ? temperature : 0.2,
      messages: [
        { role: 'system', content: system || 'Você é um assistente de nutrição. Responda sempre em português de forma clara e direta.' },
        ...messages,
      ],
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      const err = await safeText(resp)
      return new Response(JSON.stringify({ error: 'openai_error', details: err }), { status: 502, headers })
    }
    const data = await resp.json()
    const text = data.choices?.[0]?.message?.content || ''
    return new Response(JSON.stringify({ text, raw: data }), { headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'bad_request', details: String(e) }), { status: 400, headers })
  }
}

async function handleVision(request, env) {
  const headers = corsHeaders(request)
  try {
    const { imageUrl, imageBase64, prompt, temperature } = await request.json()
    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: 'imageUrl or imageBase64 required' }), { status: 400, headers })
    }

    const imageContent = imageUrl
      ? { type: 'image_url', image_url: { url: imageUrl } }
      : { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }

    const payload = {
      model: 'gpt-5-nano',
      temperature: typeof temperature === 'number' ? temperature : 0.2,
      messages: [
        {
          role: 'system',
          content: 'Você analisa fotos de refeições para identificar ingredientes e estimar calorias/macros. Responda em português com:\n- Lista de ingredientes (com gramas estimados)\n- Macros por item (kcal, proteína, carboidratos, gorduras)\n- Resumo total\nCaso a incerteza seja alta, explique as suposições.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Analise esta foto da refeição.' },
            imageContent,
          ],
        },
      ],
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      const err = await safeText(resp)
      return new Response(JSON.stringify({ error: 'openai_error', details: err }), { status: 502, headers })
    }
    const data = await resp.json()
    const text = data.choices?.[0]?.message?.content || ''
    return new Response(JSON.stringify({ text, raw: data }), { headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'bad_request', details: String(e) }), { status: 400, headers })
  }
}

async function safeText(resp) {
  try { return await resp.text() } catch { return 'unknown_error' }
}

