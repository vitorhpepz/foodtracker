import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [imagePreview, setImagePreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [installEvent, setInstallEvent] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [platform, setPlatform] = useState('web') // 'ios' | 'android' | 'web'

  const workerBase = 'https://foodtracker-api.hpepz.workers.dev'

  useEffect(() => {
    // Detect standalone (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsStandalone(standalone)
    // Basic platform detection for tailored install instructions
    const ua = navigator.userAgent || navigator.vendor || ''
    const isiOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)
    setPlatform(isiOS ? 'ios' : isAndroid ? 'android' : 'web')
    // Capture install event (Android/Chrome)
    function onBeforeInstallPrompt(e) {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    // Hide banner when app gets installed
    function onAppInstalled() {
      setIsStandalone(true)
      setInstallEvent(null)
    }
    window.addEventListener('appinstalled', onAppInstalled)
    // React to display-mode changes (some browsers update this at runtime)
    const mm = window.matchMedia('(display-mode: standalone)')
    function onDisplayModeChange(e) {
      if (e.matches) setIsStandalone(true)
    }
    mm.addEventListener?.('change', onDisplayModeChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      mm.removeEventListener?.('change', onDisplayModeChange)
    }
  }, [])

  async function onPickFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const result = reader.result
      setImagePreview(result)
      const base64 = String(result).split(',')[1]
      await analyzeImage(base64)
    }
    reader.readAsDataURL(file)
  }

  async function analyzeImage(imageBase64) {
    try {
      setIsAnalyzing(true)
      setAnalysis('')
      const resp = await fetch(`${workerBase}/api/vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, prompt: 'Analise esta foto da refeição e responda em português.' }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Erro na análise')
      setAnalysis(data.text || '')
    } catch (e) {
      setAnalysis(`Erro: ${String(e.message || e)}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      {!isStandalone && (
        <div style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #0b1220', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <strong style={{ color: '#ffffff' }}>Instale o app</strong>
          <div style={{ marginTop: 8 }}>
            {platform === 'android' && installEvent && (
              <button
                style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    await installEvent.prompt()
                    const choice = await installEvent.userChoice
                    if (choice && choice.outcome === 'accepted') {
                      setInstallEvent(null)
                    }
                  } catch {}
                }}
              >Instalar agora</button>
            )}
            {platform === 'android' && !installEvent && (
              <p style={{ margin: 0 }}>
                Se não aparecer o botão, abra o menu (⋮) do navegador e toque em "Instalar app".
              </p>
            )}
            {platform === 'ios' && (
              <ol style={{ marginTop: 6, paddingLeft: 18 }}>
                <li>Toque no botão Compartilhar (ícone de quadrado com seta para cima).</li>
                <li>Role a lista e toque em "Adicionar à Tela de Início".</li>
                <li>Confirme tocando em "Adicionar".</li>
              </ol>
            )}
            {platform === 'web' && (
              <p style={{ margin: 0 }}>Use o menu do navegador para "Instalar" ou "Adicionar à Tela de Início".</p>
            )}
          </div>
        </div>
      )}
      <h1>FoodTracker</h1>
      <p>Envie uma foto da refeição para estimar ingredientes, calorias e macros.</p>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'inline-block', marginBottom: 8 }}>Selecionar foto ou usar câmera:</label>
        <input type="file" accept="image/*" capture="environment" onChange={onPickFile} />
      </div>

      {imagePreview && (
        <div style={{ marginTop: 12 }}>
          <img src={imagePreview} alt="pré-visualização" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {isAnalyzing ? <p>Analisando...</p> : analysis && (
          <pre style={{ whiteSpace: 'pre-wrap' }}>{analysis}</pre>
        )}
      </div>
    </div>
  )
}

export default App
