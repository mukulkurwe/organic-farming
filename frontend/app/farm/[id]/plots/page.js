// app/farm/[id]/plots/page.js
// app/farm/[id]/plots/page.js
"use client";

import { useParams } from "next/navigation";
import FarmPlotsMap from "../../../../src/components/pages/farmer/FarmPlotsMap.js";

export default function FarmPlotsPage() {
  const params = useParams();
  const farmId = params.id;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Divide Farm into Plots</h1>
      <FarmPlotsMap farmId={farmId} />
    </div>
  );
}

// http://localhost:3000/farm/38/plots