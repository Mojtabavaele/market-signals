export default function Price({ asset }) {
  if (asset.last_price == null) return <div className="price muted">No price yet</div>;

  const price = Number(asset.last_price);
  const prev = asset.prev_price == null ? null : Number(asset.prev_price);
  const change = prev ? ((price - prev) / prev) * 100 : null;

  return (
    <div className="price">
      <strong>{price.toLocaleString(undefined, { style: 'currency', currency: asset.currency })}</strong>
      {change !== null && (
        <span className={change >= 0 ? 'up' : 'down'}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </div>
  );
}
