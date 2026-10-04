import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={cn(
            "relative overflow-hidden bg-stone-50",
            // First image is tall and dominant; subsequent images are slightly shorter
            i === 0 ? "aspect-[4/5]" : "aspect-[5/6]",
          )}
        >
          <Image
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
