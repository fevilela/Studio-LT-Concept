import type { Metadata } from "next";
import Image from "next/image";
import { Section, Eyebrow } from "@/components/site/section";
import { getGalleryImages } from "@/lib/data";
import { galleryImageUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Galeria | Thainá Souza",
  description: "Momentos inesquecíveis de produções de noivas.",
};

export const revalidate = 60;

export default async function GaleriaPage() {
  const images = await getGalleryImages();

  return (
    <Section className="pt-16">
      <Eyebrow>Galeria</Eyebrow>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl text-foreground">
        Momentos <span className="italic text-primary">inesquecíveis</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Fotos reais das nossas produções para noivas.
      </p>

      {images.length === 0 ? (
        <p className="mt-14 text-sm text-muted-foreground">
          Em breve, fotos reais das produções por aqui.
        </p>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary"
            >
              <Image
                src={galleryImageUrl(image.storage_path)}
                alt={image.title ?? "Produção Thainá Souza"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {(image.title || image.category) && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-white">
                    {image.title ?? image.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
