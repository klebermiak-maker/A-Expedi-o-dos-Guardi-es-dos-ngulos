import React, { useState } from 'react';
import {
  FileText,
  Download,
  X,
  Award,
  CheckCircle2,
  Star,
  User,
  GraduationCap,
} from 'lucide-react';
import { ISLAND_LEVELS } from '../data/levels';
import { generatePerformancePDF } from '../utils/pdfGenerator';
import { sound } from '../utils/sound';

interface RelatorioDesempenhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  solvedPolygonsByLevel: Record<number, string[]>;
  inspectedVertices: Record<string, boolean>;
  totalStars: number;
  maxStars: number;
}

export const RelatorioDesempenhoModal: React.FC<RelatorioDesempenhoModalProps> = ({
  isOpen,
  onClose,
  solvedPolygonsByLevel,
  inspectedVertices,
  totalStars,
  maxStars,
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate high-level stats for the preview
  let totalRight = 0;
  let identifiedRight = 0;
  let totalNonRight = 0;
  let identifiedNonRight = 0;

  ISLAND_LEVELS.forEach((lvl) => {
    const solvedIds = solvedPolygonsByLevel[lvl.id] || [];
    lvl.polygons.forEach((poly) => {
      const isPolySolved = solvedIds.includes(poly.id);
      poly.vertices.forEach((v) => {
        const isIdentified =
          isPolySolved || Boolean(inspectedVertices[`${poly.id}-${v.id}`]);
        if (v.isRight) {
          totalRight += 1;
          if (isIdentified) identifiedRight += 1;
        } else {
          totalNonRight += 1;
          if (isIdentified) identifiedNonRight += 1;
        }
      });
    });
  });

  const rightPct = totalRight > 0 ? Math.round((identifiedRight / totalRight) * 100) : 0;
  const nonRightPct =
    totalNonRight > 0 ? Math.round((identifiedNonRight / totalNonRight) * 100) : 0;
  const portalsReactivated = Object.values(solvedPolygonsByLevel).filter(
    (arr) => arr.length === 3
  ).length;

  const handleDownload = () => {
    sound.playSuccess();
    setIsExporting(true);
    try {
      generatePerformancePDF({
        studentName: studentName || 'Guardião Explorador',
        solvedPolygonsByLevel,
        inspectedVertices,
        totalStars,
        maxStars,
      });
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400">
                Portfólio Digital de Aprendizagem · BNCC EF04MA18
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Relatório de Desempenho em PDF
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Fechar modal de relatório"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Name Input for Personalized Certificate */}
        <div className="py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Nome do Aluno(a) para o Relatório:</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Digite o nome completo do aluno..."
              maxLength={48}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Quick Metrics Preview */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
              <div className="text-amber-400 font-bold text-sm flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{totalStars}/{maxStars}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Estrelas Ganhas</p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
              <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                <span>{portalsReactivated}/5</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Portais Salvos</p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
              <div className="text-sky-400 font-bold text-sm">
                {rightPct}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Acertos em 90°</p>
            </div>
          </div>

          {/* Document Summary Description */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>O que contém neste Relatório em PDF:</span>
            </div>
            <div>• Registro formal de proficiência na habilidade <strong>BNCC EF04MA18</strong>.</div>
            <div>• Gráficos comparativos de ângulos retos ($90^\circ$) vs. não retos ($&lt; 90^\circ$ e $&gt; 90^\circ$).</div>
            <div>• Detalhamento do desempenho do aluno em cada uma das 5 ilhas do reino.</div>
            <div>• Registro das ferramentas manipuladas: Esquadro 3D, Dobraduras de papel e Modo de Traçado.</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
