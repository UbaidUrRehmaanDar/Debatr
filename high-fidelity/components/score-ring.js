export function scoreRing(score, maxScore = 100) {
  const pct = Math.min(Math.max(score / maxScore, 0), 1);
  const size = 88;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  let color = '#ef4444';
  if (pct >= 0.8) color = '#22c55e';
  else if (pct >= 0.65) color = '#eab308';

  const displayScore = Math.round(pct * 100);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg);">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="#e2e8f0"
        stroke-width="${strokeWidth}"
      />
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        style="transition:stroke-dashoffset 0.8s ease;"
      />
      <text
        x="${size / 2}"
        y="${size / 2}"
        text-anchor="middle"
        dominant-baseline="central"
        transform="rotate(90, ${size / 2}, ${size / 2})"
        style="font-size:20px;font-weight:700;fill:#0f172a;"
      >${displayScore}</text>
    </svg>`;
}
