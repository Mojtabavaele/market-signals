import { useEffect, useState } from 'react';
import { listAssets, createAsset, updateAsset, deleteAsset } from './api.js';
import AssetForm from './AssetForm.jsx';
import Price from './Price.jsx';

export default function App() {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = () =>
    listAssets()
      .then(setAssets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, []);

  const handleCreate = async (form) => {
    await createAsset(form);
    await refresh();
  };

  const toggleAlerts = async (a) => {
    await updateAsset(a.id, { alerts_enabled: !a.alerts_enabled });
    refresh();
  };

  const remove = async (a) => {
    if (!confirm(`Stop monitoring ${a.symbol}?`)) return;
    await deleteAsset(a.id);
    refresh();
  };

  return (
    <main>
      <header>
        <h1>Market Signals</h1>
        <p>Assets you monitor and their volatility alert rules.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Monitored assets ({assets.length})</h2>
        {loading ? <p>Loading…</p> : (
          <ul className="assets">
            {assets.map((a) => (
              <li key={a.id}>
                <div className="main">
                  <strong>{a.symbol}</strong>
                  <span className="tag">{a.asset_type}</span>
                  <div className="muted">{a.name}{a.exchange ? ` · ${a.exchange}` : ''}</div>
                </div>
                <Price asset={a} />
                <div className="rule">
                  Alert at ±{Number(a.volatility_threshold_pct)}% / {a.alert_window_minutes} min
                </div>
                <div className="actions">
                  <button className="ghost" onClick={() => toggleAlerts(a)}>
                    Alerts: {a.alerts_enabled ? 'On' : 'Off'}
                  </button>
                  <button className="ghost danger" onClick={() => remove(a)}>Remove</button>
                </div>
              </li>
            ))}
            {!assets.length && <li className="muted">No assets yet — add one below.</li>}
          </ul>
        )}
      </section>

      <AssetForm onCreate={handleCreate} />
    </main>
  );
}
