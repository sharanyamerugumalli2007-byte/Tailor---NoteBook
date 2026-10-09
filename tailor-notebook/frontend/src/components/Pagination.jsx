export default function Pagination({ page, limit, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;
  return (
    <div className="pagination">
      <span>Page {page} of {pages} · {total} records</span>
      <div>
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="btn btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
