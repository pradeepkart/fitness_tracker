import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function AIPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('Your AI-generated plan will appear here.');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const extractText = (data) => {
    if (!data) return 'No response.';
    return data.message || data.response || data.result || (typeof data === 'string' ? data : JSON.stringify(data));
  };

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = (prompt || '').trim();
    if (!text) {
      setResponse('Please enter a prompt.');
      return;
    }
    if (loading) return; // avoid duplicate submits

    // cancel previous request
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResponse('Generating AI response...');
    try {
      const res = await api.post('/ai/generate', { prompt: text }, { signal: controller.signal, timeout: 60000 });
      setResponse(extractText(res.data));
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        setResponse('Request canceled.');
      } else if (err?.response?.data?.message) {
        setResponse(err.response.data.message);
      } else {
        setResponse('AI service unavailable.');
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [prompt, loading]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold">AI Fitness Studio</h2>
        <p className="text-slate-400">Generate workout plans, nutrition ideas, and progress coaching.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            className="min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-800 p-4"
            placeholder="Ask for a plan, recovery advice, or meal suggestions..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={2000}
            aria-label="AI prompt"
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading || !prompt.trim()} className={`rounded-xl px-4 py-3 font-semibold text-slate-950 ${loading || !prompt.trim() ? 'bg-slate-700' : 'bg-cyan-500'}`}>
              {loading ? 'Generating...' : 'Generate AI Insight'}
            </button>
            <button type="button" onClick={() => { setPrompt(''); setResponse('Your AI-generated plan will appear here.'); if (abortRef.current) try { abortRef.current.abort(); } catch (e) {} }} className="rounded-xl border border-slate-700 px-4 py-3 text-sm">Clear</button>
          </div>
        </form>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold">Response</h3>
        <p className="mt-3 text-slate-300 whitespace-pre-line break-words">{response}</p>
      </div>
    </motion.div>
  );
}
