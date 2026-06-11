// Icone SVG animate inline — nessuna dipendenza esterna

function IconAna() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <rect x="8" y="20" width="40" height="28" rx="3" fill="#166534" opacity="0.15"/>
      <rect x="8" y="20" width="40" height="28" rx="3" stroke="#22c55e" strokeWidth="1.5"/>
      <rect x="20" y="30" width="7" height="10" rx="1" fill="#22c55e" opacity="0.6"/>
      <rect x="29" y="30" width="7" height="10" rx="1" fill="#22c55e" opacity="0.6"/>
      <rect x="20" y="22" width="16" height="6" rx="1" fill="#22c55e" opacity="0.4"/>
      <path d="M4 22L28 8l24 14" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="28" cy="14" r="3" fill="#4ade80">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

function IconEn() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <defs>
        <linearGradient id="grad-en" x1="18" y1="8" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a"/>
          <stop offset="1" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="22" fill="#d97706" opacity="0.1">
        <animate attributeName="r" values="22;25;22" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <path d="M32 8L18 30h12L22 48l18-26H28L32 8z" fill="url(#grad-en)" stroke="#d97706" strokeWidth="1"/>
    </svg>
  );
}

function IconAc() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <defs>
        <linearGradient id="grad-ac" x1="14" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd"/>
          <stop offset="1" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>
      <path d="M28 8C28 8 14 24 14 34a14 14 0 0028 0C42 24 28 8 28 8z" fill="url(#grad-ac)" stroke="#2563eb" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite"/>
      </path>
      <ellipse cx="23" cy="30" rx="3" ry="5" fill="white" opacity="0.25" transform="rotate(-30 23 30)"/>
    </svg>
  );
}

function IconRi() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 28 28;360 28 28" dur="4s" repeatCount="indefinite"/>
        <path d="M28 10l6 10H22L28 10z" fill="#16a34a"/>
        <path d="M28 10l6 10H22L28 10z" fill="#16a34a" transform="rotate(120 28 28)"/>
        <path d="M28 10l6 10H22L28 10z" fill="#16a34a" transform="rotate(240 28 28)"/>
        <path d="M28 16 A14 14 0 0 1 42 28" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M42 28 A14 14 0 0 1 21 40.1" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M21 40.1 A14 14 0 0 1 28 16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

function IconInq() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <ellipse cx="28" cy="32" rx="18" ry="10" fill="#64748b" opacity="0.2"/>
      <path d="M14 32a10 10 0 0112-9.6A8 8 0 1140 32H14z" fill="#94a3b8" stroke="#64748b" strokeWidth="1">
        <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0;-2,0;0,0" dur="3s" repeatCount="indefinite"/>
      </path>
      <line x1="20" y1="38" x2="20" y2="44" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="44;47;44" dur="1.2s" repeatCount="indefinite"/>
      </line>
      <line x1="27" y1="38" x2="27" y2="46" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="46;49;46" dur="1.4s" repeatCount="indefinite" begin="0.2s"/>
      </line>
      <line x1="34" y1="38" x2="34" y2="43" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="43;46;43" dur="1.1s" repeatCount="indefinite" begin="0.4s"/>
      </line>
    </svg>
  );
}

function IconBiod() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <defs>
        <linearGradient id="grad-biod" x1="10" y1="12" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86efac"/>
          <stop offset="1" stopColor="#166534"/>
        </linearGradient>
      </defs>
      <path d="M28 44C28 44 10 36 10 20C10 20 20 12 36 16C44 18 46 28 40 36C36 40 28 44 28 44Z" fill="url(#grad-biod)" stroke="#15803d" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="0 28 28;3 28 28;0 28 28;-3 28 28;0 28 28" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M28 44 C28 44 28 28 20 18" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M24 26 C26 24 30 24 32 26" stroke="#15803d" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

function IconPe() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <circle cx="20" cy="20" r="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="1">
        <animate attributeName="cy" values="20;18;20" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="36" cy="20" r="7" fill="#f472b6" stroke="#db2777" strokeWidth="1">
        <animate attributeName="cy" values="20;18;20" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <path d="M6 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M28 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IconGov() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <rect x="14" y="26" width="28" height="22" rx="4" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" strokeWidth="1.5"/>
      <path d="M20 26v-6a8 8 0 0116 0v6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="d" values="M20 26v-6a8 8 0 0116 0v6;M20 26v-8a8 8 0 0116 0v8;M20 26v-6a8 8 0 0116 0v6" dur="3s" repeatCount="indefinite"/>
      </path>
      <circle cx="28" cy="35" r="3.5" fill="#7c3aed">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <rect x="26.5" y="36" width="3" height="5" rx="1" fill="#7c3aed"/>
    </svg>
  );
}

function IconDefault() {
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56">
      <circle cx="28" cy="28" r="20" fill="#16a34a" opacity="0.15" stroke="#16a34a" strokeWidth="1.5">
        <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="28" y="35" textAnchor="middle" fontSize="20" fill="#22c55e">🌿</text>
    </svg>
  );
}

const iconMap = {
  ana: IconAna,
  en: IconEn,
  ac: IconAc,
  ri: IconRi,
  inq: IconInq,
  biod: IconBiod,
  pe: IconPe,
  gov: IconGov,
};

export function SectionIconAnimated({ sectionId }) {
  const Icon = iconMap[sectionId] || IconDefault;
  return <Icon />;
}

export default SectionIconAnimated;