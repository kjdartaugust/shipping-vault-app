import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShipmentForm } from "@/components/shipment-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "New shipment — ShipVault" };

export default function NewShipmentPage() {
  return (
    <>
      <Link
        href="/dashboard/shipments"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Shipments
      </Link>
      <PageHeader
        title="Book a shipment"
        description="A tracking number and waybill are generated automatically."
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <ShipmentForm />
        </CardContent>
      </Card>
    </>
  );
}
