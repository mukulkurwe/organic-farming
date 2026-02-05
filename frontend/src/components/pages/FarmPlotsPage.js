"use client";

import { useParams } from "next/navigation";
import FarmPlotsMap from "@/components/farmer/FarmPlotsMap.js";

export default function FarmPlotsPage() {
  const params = useParams();
  const farmId = params.id; // /farmer/farms/[id]/plots

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold mb-2">Farm Plots</h1>
      <p className="text-gray-600 mb-4">
        Draw plots inside your farm boundary and assign crops.
      </p>

      <FarmPlotsMap farmId={farmId} />
    </div>
  );
}
