import { Card, CardContent } from "@/components/ui/card";

export default function AdminGaleriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Galeria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload e gestão das fotos exibidas no site.
        </p>
      </div>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          O upload de fotos (via Supabase Storage) ainda está em desenvolvimento e será
          adicionado em uma próxima etapa.
        </CardContent>
      </Card>
    </div>
  );
}
