"use client";

import Image from "next/image";

type Props = {
  phase: number; // 0.0 to 1.0 from OpenWeather
};

function getPhaseName(phase: number): string {
  if (phase === 0) return "new-moon";
  if (phase > 0 && phase < 0.25) return "waxing-crescent";
  if (phase === 0.25) return "first-quarter";
  if (phase > 0.25 && phase < 0.5) return "waxing-gibbous";
  if (phase === 0.5) return "full";
  if (phase > 0.5 && phase < 0.75) return "waning-gibbous";
  if (phase === 0.75) return "last-quarter";
  return "waning-crescent"; // 0.76 - 0.99
}

export function MoonPhase({ phase }: Props) {
  const phaseName = getPhaseName(phase);
  const imagePath = `./moon/${phaseName}.svg`;

  return (
    <div className="flex items-center gap-2">
      <Image src={imagePath} alt={phaseName} width={94} height={94} />
    </div>
  );
}
