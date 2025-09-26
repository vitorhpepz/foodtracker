import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [imagePreview, setImagePreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')

  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        new Notification('FoodTracker', { body: 'Notifications enabled!' })
      }
    } catch (e) {
      console.error('Notification permission error', e)
    }
  }

  const workerBase = 'https://foodtracker-api.hpepz.workers.dev'

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
        body: JSON.stringify({ imageBase64 }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Vision error')
      setAnalysis(data.text || '')
    } catch (e) {
      setAnalysis(`Error: ${String(e.message || e)}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        <div style={{ marginTop: 16 }}>
          <p>Notification permission: {permission}</p>
          {permission !== 'granted' && (
            <button onClick={requestNotificationPermission}>Enable Notifications</button>
          )}
        </div>
        <div style={{ marginTop: 24 }}>
          <h3>Analyze a meal photo</h3>
          <input type="file" accept="image/*" capture="environment" onChange={onPickFile} />
          {imagePreview && (
            <div style={{ marginTop: 12 }}>
              <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            {isAnalyzing ? <p>Analyzing...</p> : analysis && (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{analysis}</pre>
            )}
          </div>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
