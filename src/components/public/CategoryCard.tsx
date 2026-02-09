"use client";

import Image from "next/image";
import Link from "next/link";

/** Fallback cover images for sub-categories (فواكه، خضروات، ورقيات) */
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  فواكه: "https://dyj6gt4964deb.cloudfront.net/images/crop-d7428b52-4567-4fb2-b45a-bd60976e9454.jpeg",
  خضروات: "https://dyj6gt4964deb.cloudfront.net/images/crop-c60e0b52-a37e-4b8d-9b1c-9368409a20a8.jpeg",
  ورقيات: "https://dyj6gt4964deb.cloudfront.net/images/crop-99d98a35-378a-49d5-8e05-c8ed60b17ed3.jpeg",
};

interface Category {
  id: string;
  name_ar: string;
  imageUrl?: string | null;
}

export default function CategoryCard({
  category,
  onClick,
  href,
}: {
  category: Category;
  onClick?: () => void;
  href?: string;
}) {
  const imgUrl = category.imageUrl || CATEGORY_COVER_IMAGES[category.name_ar];
  const content = (
    <>
      <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={category.name_ar}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center text-5xl">
            🍎
          </div>
        )}
        {/* Minimal overlay for text readability - preserves original image colors */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <span className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg text-center px-4">
            {category.name_ar}
          </span>
        </div>
      </div>
    </>
  );

  const className = "w-full max-w-full rounded-2xl overflow-hidden shadow-md border border-orange-100/50 bg-white block min-w-0 transition-shadow hover:shadow-lg";
  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
