"use client";

import dynamic from "next/dynamic";

const FarmMapLeaflet = dynamic(
  () => import("./FarmMapLeaflet"),
  { ssr: false }
);

export default function FarmMapWrapper() {
  return <FarmMapLeaflet />;
}
