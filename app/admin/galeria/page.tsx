import { Card, CardContent } from "@/components/ui/card";
import { getAllGalleryImages } from "@/lib/admin-data/gallery";
import { GalleryUploadDialog } from "@/components/admin/gallery-upload-dialog";
import { GalleryImageCard } from "@/components/admin/gallery-image-card";

export const dynamic = "force-dynamic";

export default async function AdminGaleriaPage() {
  const images = await getAllGalleryImages();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Galeria</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Fotos de produções reais, exibidas na página pública{" "}
            <span className="font-medium text-foreground">/galeria</span> para mostrar o
            trabalho do estúdio a futuras noivas. Envie as fotos aqui e elas aparecem
            automaticamente no site — use o botão &quot;Visível/Oculta&quot; para escolher quais
            entram no ar, e as setas para definir a ordem de exibição.
          </p>
        </div>
        <GalleryUploadDialog />
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma foto enviada ainda. Clique em &quot;Enviar foto&quot; para começar a montar a
            galeria do site.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <GalleryImageCard
              key={image.id}
              image={image}
              isFirst={index === 0}
              isLast={index === images.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
