import React, { useState } from 'react';
import { X, Compass, Layers, RotateCw, CheckCircle2 } from 'lucide-react';
import { IslandPolygonData, PolygonVertexData } from '../data/levels';
import { sound } from '../utils/sound';

interface DobraduraModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePolygon: IslandPolygonData;
  activeVertex: PolygonVertexData;
}

export const DobraduraModal: React.FC<DobraduraModalProps> = ({
  isOpen,
  onClose,
  activePolygon,
  activeVertex,
}) => {
  const [foldStep, setFoldStep] = useState<number>(1);
  const [esquadroRotation, setEsquadroRotation] = useState<number>(0);

  if (!isOpen) return null;

  const angleRad = (activeVertex.angleDeg * Math.PI) / 180;
  const armLength = 105;
  const endX = 140 + Math.cos(-angleRad) * armLength;
  const endY = 170 + Math.sin(-angleRad) * armLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-medium text-amber-400">
              Recurso BNCC EF04MA18 · Dobraduras e Esquadro Geométrico
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Oficina de Dobradura & Esquadro: {activePolygon.name}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Fechar oficina de dobradura"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* Interactive Visual Comparison Stage */}
          <div className="flex flex-col items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Comparador de Canto (Papel Dobrado 90°)</span>
              <span className="font-mono-tabular text-amber-300">
                {activeVertex.label}: {activeVertex.angleDeg}°
              </span>
            </div>

            <svg viewBox="0 0 280 230" className="w-full h-52 overflow-visible">
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="280" height="230" rx="10" fill="url(#gridPattern)" />

              {/* Step 1-3 Paper Folding Ghost / Reference */}
              {foldStep >= 1 && (
                <g transform={`translate(140, 170) rotate(${esquadroRotation})`}>
                  {/* Folded Paper / 90 deg Esquadro Reference */}
                  <polygon
                    points="0,0 110,0 0,-110"
                    fill="rgba(245, 158, 11, 0.18)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray={foldStep === 1 ? '5,4' : 'none'}
                  />
                  {/* Right angle 90 square marker on the esquadro */}
                  <rect
                    x="0"
                    y="-22"
                    width="22"
                    height="22"
                    fill="rgba(16, 185, 129, 0.25)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <text x="28" y="-8" fill="#fbbf24" fontSize="11" fontWeight="bold">
                    Esquadro 90°
                  </text>
                </g>
              )}

              {/* Actual Vertex Angle Arms */}
              <g>
                {/* Base Arm */}
                <line
                  x1="140"
                  y1="170"
                  x2={140 + armLength}
                  y2="170"
                  stroke="#38bdf8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Second Arm at angleDeg */}
                <line
                  x1="140"
                  y1="170"
                  x2={endX}
                  y2={endY}
                  stroke={activeVertex.isRight ? '#10b981' : '#f43f5e'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Vertex Point */}
                <circle
                  cx="140"
                  cy="170"
                  r="7"
                  fill={activeVertex.isRight ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Label */}
                <text
                  x="140"
                  y="198"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {activeVertex.label} ({activeVertex.angleDeg}° —{' '}
                  {activeVertex.isRight
                    ? 'Ângulo Reto'
                    : activeVertex.angleDeg < 90
                    ? 'Não Reto · Menor que 90°'
                    : 'Não Reto · Maior que 90°'}
                  )
                </text>
              </g>
            </svg>

            <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      sound.playToolEquip();
                      setFoldStep(step);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      foldStep === step
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Dobra {step}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setEsquadroRotation((r) => (r === 0 ? -15 : 0));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Ajustar Esquadro
              </button>
            </div>
          </div>

          {/* Step-by-Step Pedagogical Instructions */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-800/70 border border-slate-700/80 p-4">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Como fazer seu Esquadro de Dobradura</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {foldStep === 1 &&
                    'Passo 1: Pegue uma folha de papel qualquer e faça uma primeira dobra reta ao meio, marcando bem o vinco.'}
                  {foldStep === 2 &&
                    'Passo 2: Agora dobre a folha uma segunda vez, fazendo a linha da primeira dobra coincidir exatamente sobre ela mesma!'}
                  {foldStep === 3 &&
                    'Passo 3: Pronto! O canto fechado que surgiu tem exatamente 90° (um Ângulo Reto perfeito). Use-o para medir qualquer figura!'}
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/70 border border-slate-700/80 p-4">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mb-1">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>O que acontece no {activeVertex.label}?</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeVertex.esquadroTip}
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {activePolygon.foldingConcept}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Lados no vértice: {activeVertex.adjacentSidesLabel}</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
              >
                Voltar à Exploração 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
