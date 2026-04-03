interface BotanicalBackgroundProps {
  intensity?: 'full' | 'light'
}

export default function BotanicalBackground({
  intensity = 'full',
}: BotanicalBackgroundProps) {
  const o = intensity === 'light' ? 0.55 : 1

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 390 720"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: o }}
      aria-hidden="true"
    >
      {/* Watercolour washes */}
      <ellipse cx="80" cy="80" rx="160" ry="130" fill="rgba(122,158,135,0.10)" />
      <ellipse cx="310" cy="640" rx="160" ry="130" fill="rgba(122,158,135,0.09)" />
      <ellipse cx="340" cy="100" rx="90" ry="70" fill="rgba(122,158,135,0.06)" />
      <ellipse cx="60" cy="620" rx="90" ry="70" fill="rgba(122,158,135,0.07)" />

      {/* Top-left cluster */}
      <path d="M10,10 Q60,80 30,160" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="22" cy="40" rx="14" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(-50 22 40)" />
      <ellipse cx="32" cy="65" rx="16" ry="5" fill="#7a9e87" opacity="0.30" transform="rotate(-40 32 65)" />
      <ellipse cx="36" cy="92" rx="18" ry="5" fill="#6a9178" opacity="0.30" transform="rotate(-30 36 92)" />
      <ellipse cx="34" cy="120" rx="16" ry="5" fill="#7a9e87" opacity="0.28" transform="rotate(-20 34 120)" />
      <ellipse cx="28" cy="145" rx="12" ry="4" fill="#7a9e87" opacity="0.25" transform="rotate(-10 28 145)" />
      <path d="M0,30 Q80,60 120,20" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.4" />
      <ellipse cx="30" cy="28" rx="12" ry="4" fill="#7a9e87" opacity="0.28" transform="rotate(10 30 28)" />
      <ellipse cx="60" cy="32" rx="14" ry="4" fill="#5a8a6a" opacity="0.25" transform="rotate(5 60 32)" />
      <ellipse cx="90" cy="26" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(-5 90 26)" />
      <circle cx="100" cy="45" r="9" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="118" cy="58" r="7" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.25" />
      <circle cx="80" cy="72" r="8" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.22" />

      {/* Top-right cluster */}
      <path d="M390,10 Q340,80 360,160" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="378" cy="40" rx="14" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(50 378 40)" />
      <ellipse cx="368" cy="65" rx="16" ry="5" fill="#7a9e87" opacity="0.30" transform="rotate(40 368 65)" />
      <ellipse cx="364" cy="92" rx="18" ry="5" fill="#6a9178" opacity="0.30" transform="rotate(28 364 92)" />
      <ellipse cx="366" cy="120" rx="16" ry="5" fill="#7a9e87" opacity="0.28" transform="rotate(18 366 120)" />
      <path d="M390,25 Q310,55 270,20" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.40" />
      <ellipse cx="360" cy="26" rx="12" ry="4" fill="#7a9e87" opacity="0.27" transform="rotate(-10 360 26)" />
      <ellipse cx="330" cy="30" rx="14" ry="4" fill="#5a8a6a" opacity="0.24" transform="rotate(-5 330 30)" />
      <circle cx="285" cy="50" r="9" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.28" />
      <circle cx="268" cy="64" r="7" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.24" />

      {/* Left-mid fern */}
      <path d="M0,310 Q55,330 20,420" stroke="#7a9e87" strokeWidth="1.3" fill="none" opacity="0.35" />
      <ellipse cx="14" cy="335" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(-35 14 335)" />
      <ellipse cx="24" cy="358" rx="14" ry="4.5" fill="#7a9e87" opacity="0.20" transform="rotate(-25 24 358)" />
      <ellipse cx="27" cy="382" rx="14" ry="4.5" fill="#6a9178" opacity="0.18" transform="rotate(-15 27 382)" />

      {/* Right-mid fern */}
      <path d="M390,300 Q335,320 370,410" stroke="#7a9e87" strokeWidth="1.3" fill="none" opacity="0.35" />
      <ellipse cx="376" cy="325" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(35 376 325)" />
      <ellipse cx="366" cy="348" rx="14" ry="4.5" fill="#7a9e87" opacity="0.20" transform="rotate(25 366 348)" />
      <ellipse cx="362" cy="372" rx="14" ry="4.5" fill="#6a9178" opacity="0.18" transform="rotate(14 362 372)" />

      {/* Bottom-left cluster */}
      <path d="M0,720 Q70,640 30,560" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.50" />
      <ellipse cx="20" cy="688" rx="16" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(40 20 688)" />
      <ellipse cx="32" cy="662" rx="18" ry="5.5" fill="#7a9e87" opacity="0.30" transform="rotate(30 32 662)" />
      <ellipse cx="36" cy="634" rx="18" ry="5" fill="#6a9178" opacity="0.28" transform="rotate(20 36 634)" />
      <ellipse cx="32" cy="608" rx="15" ry="4.5" fill="#7a9e87" opacity="0.25" transform="rotate(10 32 608)" />
      <path d="M0,700 Q80,670 140,710" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.38" />
      <ellipse cx="72" cy="682" rx="15" ry="4.5" fill="#5a8a6a" opacity="0.22" transform="rotate(-3 72 682)" />
      <circle cx="115" cy="660" r="10" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="135" cy="644" r="8" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.26" />
      <circle cx="95" cy="645" r="9" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.23" />

      {/* Bottom-right cluster */}
      <path d="M390,720 Q320,640 360,555" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.50" />
      <ellipse cx="370" cy="690" rx="16" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(-40 370 690)" />
      <ellipse cx="358" cy="664" rx="18" ry="5.5" fill="#7a9e87" opacity="0.30" transform="rotate(-30 358 664)" />
      <ellipse cx="354" cy="636" rx="18" ry="5" fill="#6a9178" opacity="0.28" transform="rotate(-20 354 636)" />
      <ellipse cx="358" cy="610" rx="15" ry="4.5" fill="#7a9e87" opacity="0.25" transform="rotate(-10 358 610)" />
      <path d="M390,705 Q310,672 248,708" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.38" />
      <ellipse cx="318" cy="684" rx="15" ry="4.5" fill="#5a8a6a" opacity="0.22" transform="rotate(3 318 684)" />
      <circle cx="275" cy="658" r="10" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="255" cy="642" r="8" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.26" />
      <circle cx="295" cy="643" r="9" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.23" />

      {/* Subtle centre ferns */}
      <path d="M150,200 Q170,240 155,280" stroke="#7a9e87" strokeWidth="0.8" fill="none" opacity="0.12" />
      <ellipse cx="157" cy="220" rx="10" ry="3" fill="#7a9e87" opacity="0.08" transform="rotate(-25 157 220)" />
      <ellipse cx="158" cy="248" rx="11" ry="3" fill="#7a9e87" opacity="0.08" transform="rotate(-15 158 248)" />
      <path d="M240,480 Q260,520 245,560" stroke="#7a9e87" strokeWidth="0.8" fill="none" opacity="0.10" />
      <ellipse cx="247" cy="500" rx="10" ry="3" fill="#7a9e87" opacity="0.07" transform="rotate(-20 247 500)" />
      <circle cx="170" cy="510" r="6" fill="none" stroke="#7a9e87" strokeWidth="1" opacity="0.10" />
      <circle cx="220" cy="200" r="5" fill="none" stroke="#7a9e87" strokeWidth="0.8" opacity="0.09" />
    </svg>
  )
}
