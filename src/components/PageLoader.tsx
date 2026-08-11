/**
 * Minimal spinner shown via Suspense while a lazy route chunk loads.
 */
const PageLoader = () => (
  <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#F5B800] border-t-transparent animate-spin" />
  </div>
);

export default PageLoader;
