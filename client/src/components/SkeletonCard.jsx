export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
