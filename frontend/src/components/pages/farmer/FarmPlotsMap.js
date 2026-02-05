// src/components/farmer/FarmPlotsMap.js
"use client";
import dynamic from "next/dynamic";

const FarmPlotsMapClient = dynamic(
  () => import("./FarmPlotsMapClient"),
  { ssr: false }
);

export default function FarmPlotsMap(props) {
  return <FarmPlotsMapClient {...props} />;
}
