export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    if (url.pathname === '/api/push/test' && request.method === 'POST') {
      return new Response(JSON.stringify({ sent: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response('Not Found', { status: 404 })
  },
}

