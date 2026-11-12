import React, { useState } from 'react';
import {
  Compass,
  Layers,
  RotateCw,
  Eye,
  Check,
  CheckSquare,
  Square,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleStepNext = () => {
    sound.playClick();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepPrev = () => {
    sound.playClick();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (!hasAgreed) return;
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400">
                Guia do Explorador · BNCC EF04MA18
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Tutorial Interativo dos Guardiões dos Ângulos
              </h2>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono-tabular">
            Passo {currentStep} de {totalSteps}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6 min-h-[220px] flex flex-col justify-center">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                <Compass className="w-4 h-4" />
                <span>1. O Que é um Ângulo Reto?</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Um <strong>Ângulo Reto</strong> tem exatamente <strong>90°</strong> e forma um canto perfeito em formato de <strong>L</strong>, como a quina de uma folha de papel, a borda de uma porta ou a ponta do nosso esquadro.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/30 p-3 text-xs">
                  <div className="font-bold text-emerald-400 mb-1">■ Ângulo Reto (90°)</div>
                  <p className="text-slate-300 text-[11px]">Encaixe perfeito de 90°. Marcado com o símbolo de quadrado e ponto (■).</p>
                </div>
                <div className="rounded-xl bg-sky-950/50 border border-sky-500/30 p-3 text-xs">
                  <div className="font-bold text-sky-400 mb-1">▲ ou ◆ Ângulo Não Reto</div>
                  <p className="text-slate-300 text-[11px]">Mais fechado que 90° (&lt; 90° agudo) ou mais aberto que 90° (&gt; 90° obtuso).</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Eye className="w-4 h-4" />
                <span>2. Como Inspecionar Vértices & Sonar Direcional</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Ao selecionar uma figura, você pode clicar nos <strong>Vértices (A, B, C...)</strong> para medir a abertura de cada canto. O jogo possui um <strong>Radar Sonoro Direcional</strong>: mova o cursor na cena e ouça sinos cristalinos ficarem mais nítidos e rápidos quando estiver perto de um <strong>Ângulo Reto (90°)</strong>!
              </p>
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5">
                  <div className="font-semibold text-slate-200 mb-0.5">Sonar de 90°</div>
                  <p className="text-slate-400 text-[11px]">Sons estéreo guiam seus ouvidos até os cantos retos.</p>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5">
                  <div className="font-semibold text-slate-200 mb-0.5">Esquadro 3D</div>
                  <p className="text-slate-400 text-[11px]">Encaixe o esquadro virtual de 90° diretamente no vértice.</p>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5">
                  <div className="font-semibold text-slate-200 mb-0.5">Girar & Zoom</div>
                  <p className="text-slate-400 text-[11px]">Aproxime e gire no espaço para observar os lados.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Layers className="w-4 h-4" />
                <span>3. O Recurso de Dobradura de Papel</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Se tiver qualquer dúvida sobre se um canto é de 90°, clique no botão <strong>Simular Dobradura</strong>!
              </p>
              <div className="rounded-xl bg-amber-950/40 border border-amber-500/30 p-3.5 text-xs text-slate-200 leading-relaxed">
                Dobre uma folha de papel duas vezes (a segunda dobra sobre a primeira) para criar seu próprio esquadro artesanal de 90°. O comparador interativo mostra se o vértice do polígono encaixa, fica menor ou ultrapassa essa dobra!
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>4. Missão: Reativar os 5 Portais do Reino</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Em cada uma das 5 ilhas, responda aos desafios de cada figura. Ao acertar, você ganha <strong>Estrelas de Ouro</strong>, derrota o vilão <strong>Neblino</strong> e reativa o portal mágico da ilha!
              </p>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-white">Dicas rápidas de navegação:</div>
                <div>• Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">H</kbd> para ocultar ou exibir o painel inferior e ver a cena 3D inteira.</div>
                <div>• Use o mouse, toque ou as teclas <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">WASD</kbd> para caminhar com o Explorador na ilha.</div>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => {
                sound.playClick();
                setCurrentStep(step);
              }}
              className={`h-2 rounded-full transition-all ${
                currentStep === step ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              aria-label={`Ir para passo ${step}`}
            />
          ))}
        </div>

        {/* Mandatory Student Checkbox "Li e Entendi" */}
        <div className="pt-4 border-t border-slate-800">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={hasAgreed}
              onClick={() => {
                sound.playClick();
                setHasAgreed(!hasAgreed);
              }}
              className={`flex items-center justify-center w-5 h-5 rounded transition-colors shrink-0 ${
                hasAgreed
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 border border-slate-600 text-transparent'
              }`}
            >
              {hasAgreed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
            </button>
            <div className="text-xs">
              <span className="font-bold text-white">Li e entendi como jogar e usar as ferramentas</span>
              <p className="text-[11px] text-slate-400">
                Marque esta caixa de seleção para confirmar que está pronto para iniciar a expedição geométrica.
              </p>
            </div>
          </label>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-2">
          <button
            onClick={handleStepPrev}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            ← Voltar
          </button>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                onClick={handleStepNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={handleFinish}
              disabled={!hasAgreed}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
                hasAgreed
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Começar a Aventura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
