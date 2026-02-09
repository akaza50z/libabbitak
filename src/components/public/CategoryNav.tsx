"use client";

interface Category {
  id: string;
  name_ar: string;
}

export default function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-orange-100/60 overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="flex gap-2 px-4 py-3 min-w-max justify-center">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-5 py-3 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-manipulation ${
              activeId === c.id
                ? "text-white shadow-md"
                : "bg-white text-[#c2410c] border-2 border-orange-300 hover:bg-orange-50"
            }`}
            style={activeId === c.id ? { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" } : undefined}
          >
            {c.name_ar}
          </button>
        ))}
      </div>
    </nav>
  );
}
