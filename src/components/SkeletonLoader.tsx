export function SkeletonCard() {
  return (
    <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 animate-pulse">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-[#1e2d45] mb-4" />

      {/* Title */}
      <div className="h-6 bg-[#1e2d45] rounded mb-4 w-3/4" />

      {/* Subtitle */}
      <div className="h-4 bg-[#1e2d45] rounded mb-3 w-1/2" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-4 bg-[#1e2d45] rounded" />
        <div className="h-4 bg-[#1e2d45] rounded" />
      </div>

      {/* Button */}
      <div className="h-10 bg-[#1e2d45] rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonFormField() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-[#1e2d45] rounded w-1/4" />
      <div className="h-10 bg-[#1e2d45] rounded" />
    </div>
  );
}

export function SkeletonRequest() {
  return (
    <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 animate-pulse space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-4 bg-[#1e2d45] rounded w-1/4" />
          <div className="h-10 bg-[#1e2d45] rounded" />
        </div>
      ))}
      <div className="h-12 bg-[#1e2d45] rounded" />
    </div>
  );
}
