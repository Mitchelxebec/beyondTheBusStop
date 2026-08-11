import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-6 gap-5 text-center">
      <span className="text-6xl font-black text-[#F5B800]">404</span>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold text-gray-900">Page not found</h1>
        <p className="text-xs text-gray-500">This route doesn't exist yet.</p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-full bg-[#F5B800] text-[#1A1A1A] text-sm font-semibold
          shadow-[0_2px_12px_rgba(245,184,0,0.35)] hover:bg-[#FFCA28]
          active:scale-[0.97] transition-all duration-150"
      >
        Go home
      </button>
    </main>
  );
};

export default NotFound;
