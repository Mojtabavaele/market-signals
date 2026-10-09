import { useState } from 'react';

const TYPES = ['stock', 'etf', 'crypto', 'forex', 'commodity'];
const EMPTY = { symbol: '', name: '', asset_type: 'stock', volatility_threshold_pct: 5, alert_window_minutes: 60 };

export default function AssetForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onCreate(form);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Add asset</h2>
      <div className="grid">
        <label>Symbol
          <input value={form.symbol} onChange={set('symbol')} placeholder="AAPL" required />
        </label>
        <label>Name
          <input value={form.name} onChange={set('name')} placeholder="Apple Inc." required />
        </label>
        <label>Type
          <select value={form.asset_type} onChange={set('asset_type')}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>Alert threshold (%)
          <input type="number" step="0.1" min="0.1" value={form.volatility_threshold_pct} onChange={set('volatility_threshold_pct')} />
        </label>
        <label>Window (minutes)
          <input type="number" min="1" value={form.alert_window_minutes} onChange={set('alert_window_minutes')} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button disabled={busy}>{busy ? 'Adding…' : 'Add asset'}</button>
    </form>
  );
}
