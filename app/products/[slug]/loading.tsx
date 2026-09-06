export default function ProductLoading() {
  return (
    <div className="pt-[100px] luxe-container py-12" aria-busy="true" aria-label="Loading product">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square rounded-lg bg-burgundy/10" />
        <div className="space-y-5 py-6">
          <div className="h-4 w-24 rounded bg-burgundy/10" />
          <div className="h-10 w-3/4 rounded bg-burgundy/10" />
          <div className="h-6 w-32 rounded bg-burgundy/10" />
          <div className="h-24 w-full rounded bg-burgundy/10" />
          <div className="h-12 w-full rounded bg-burgundy/10" />
        </div>
      </div>
    </div>
  );
}
