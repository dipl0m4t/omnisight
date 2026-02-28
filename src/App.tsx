import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f172a]">
      <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
        OmniSight
      </h1>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Bitcoin Card */}
        <div className="w-72 rounded-2xl border border-cyan-500/50 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-sm transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:border-cyan-400/70">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">₿</span>
            <span className="text-xl font-semibold text-slate-100">Bitcoin</span>
            <span className="text-sm font-mono text-cyan-400">BTC</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">$95,230</p>
          <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
            <span>▲</span> +2.4%
          </p>
        </div>

        {/* Ethereum Card */}
        <div className="w-72 rounded-2xl border border-violet-500/50 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-sm transition-all hover:shadow-[0_0_40px_rgba(139,92,246,0.25)] hover:border-violet-400/70">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">Ξ</span>
            <span className="text-xl font-semibold text-slate-100">Ethereum</span>
            <span className="text-sm font-mono text-violet-400">ETH</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">$2,745</p>
          <p className="text-red-400 text-sm font-medium flex items-center gap-1">
            <span>▼</span> -1.1%
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
