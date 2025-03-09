import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-muted m-5">
      <CardContent className="pt-6">
        <h1 className="text-3xl font-bold mb-4">404 - Tidak Ditemukan</h1>
        <p>Halaman yang Anda tuju tidak ditemukan.</p>
      </CardContent>
    </Card>
  );
}
