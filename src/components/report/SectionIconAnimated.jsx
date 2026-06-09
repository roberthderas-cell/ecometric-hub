// Icone animate CSS tematiche per ogni sezione VSME
// Nessuna dipendenza esterna — tutto inline con Tailwind + CSS

const icons = {
  // Anagrafica — edificio
  ana: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
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
  ),

  // Energia — fulmine
  en: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="28" cy="28" r="22" fill="#d97706" opacity="0.1">
        <animate attributeName="r" values="22;25;22" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <path d="M32 8L18 30h12L22 48l18-26H28L32 8z" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
      <path d="M32 8L18 30h12L22 48l18-26H28L32 8z" fill="url(#bolt)" opacity="0.8"/>
      <defs>
        <linearGradient id="bolt" x1="18" y1="8" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a"/>
          <stop offset="1" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // Acqua — goccia
  ac: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <path d="M28 8C28 8 14 24 14 34a14 14 0 0028 0C42 24 28 8 28 8z" fill="url(#drop)" stroke="#2563eb" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite"/>
      </path>
      <ellipse cx="23" cy="30" rx="3" ry="5" fill="white" opacity="0.25" transform="rotate(-30 23 30)"/>
      <defs>
        <linearGradient id="drop" x1="14" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd"/>
          <stop offset="1" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // Rifiuti — frecce riciclo
  ri: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
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
  ),

  // Inquinamento — nuvola
  inq: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
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
  ),

  // Biodiversità — foglia
  biod: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <path d="M28 44C28 44 10 36 10 20C10 20 20 12 36 16C44 18 46 28 40 36C36 40 28 44 28 44Z" fill="url(#leaf)" stroke="#15803d" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="0 28 28;3 28 28;0 28 28;-3 28 28;0 28 28" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M28 44 C28 44 28 28 20 18" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M24 26 C26 24 30 24 32 26" stroke="#15803d" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7"/>
      <defs>
        <linearGradient id="leaf" x1="10" y1="12" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86efac"/>
          <stop offset="1" stopColor="#166534"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  // Personale — persone
  pe: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="20" cy="20" r="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="1">
        <animate attributeName="cy" values="20;18;20" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="36" cy="20" r="7" fill="#f472b6" stroke="#db2777" strokeWidth="1">
        <animate attributeName="cy" values="20;18;20" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <path d="M6 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M28 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  // Governance — lucchetto
  gov: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <rect x="14" y="26" width="28" height="22" rx="4" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" strokeWidth="1.5"/>
      <path d="M20 26v-6a8 8 0 0116 0v6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="d" values="M20 26v-6a8 8 0 0116 0v6;M20 26v-8a8 8 0 0116 0v8;M20 26v-6a8 8 0 0116 0v6" dur="3s" repeatCount="indefinite"/>
      </path>
      <circle cx="28" cy="35" r="3.5" fill="#7c3aed">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <rect x="26.5" y="36" width="3" height="5" rx="1" fill="#7c3aed"/>
    </svg>
  ),

  // Default — ESG foglia
  default: (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="28" cy="28" r="20" fill="#16a34a" opacity="0.15" stroke="#16a34a" strokeWidth="1.5">
        <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="28" y="35" textAnchor="middle" fontSize="20" fill="#22c55e">🌿</text>
    </svg>
  ),
};

export function SectionIconAnimated({ sectionId }) {
  return icons[sectionId] || icons.default;
}

export default SectionIconAnimated;