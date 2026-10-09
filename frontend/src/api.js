async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const listAssets = () => request('/assets');
export const createAsset = (body) => request('/assets', { method: 'POST', body: JSON.stringify(body) });
export const updateAsset = (id, body) => request(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteAsset = (id) => request(`/assets/${id}`, { method: 'DELETE' });
