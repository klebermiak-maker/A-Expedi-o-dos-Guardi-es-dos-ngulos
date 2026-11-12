import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Compass,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Star,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Eye,
  Award,
  ArrowRight,
  HelpCircle,
  BarChart3,
  BookOpen,
  PenTool,
  FileText,
} from 'lucide-react';
import { ISLAND_LEVELS, IslandLevelData, IslandPolygonData, PolygonVertexData } from './data/levels';
import { ThreeScene, CameraMode } from './components/ThreeScene';
import { DobraduraModal } from './components/DobraduraModal';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { ModoTracadoModal } from './components/ModoTracadoModal';
import { RelatorioDesempenhoModal } from './components/RelatorioDesempenhoModal';
import { sound } from './utils/sound';

export function App() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const currentLevel: IslandLevelData = ISLAND_LEVELS[currentLevelIdx];

  const [activePolygonId, setActivePolygonId] = useState<string>(currentLevel.polygons[0].id);
  const activePolygon: IslandPolygonData =
    currentLevel.polygons.find((p) => p.id === activePolygonId) || currentLevel.polygons[0];

  const [activeVertexId, setActiveVertexId] = useState<string>(activePolygon.vertices[0].id);
  const activeVertex: PolygonVertexData =
    activePolygon.vertices.find((v) => v.id === activeVertexId) || activePolygon.vertices[0];

  // Track solved polygons across all levels
  const [solvedPolygonsByLevel, setSolvedPolygonsByLevel] = useState<Record<number, string[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });

  // Track inspected vertices for extra discovery reward
  const [inspectedVertices, setInspectedVertices] = useState<Record<string, boolean>>({});

  // Dock & Tool states
  const [dockTab, setDockTab] = useState<'inspecionar' | 'desafio' | 'missao'>('inspecionar');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('inspecao');
  const [showEsquadro3D, setShowEsquadro3D] = useState<boolean>(true);
  const [polygonRotationY, setPolygonRotationY] = useState<number>(0);
  const [polygonZoom, setPolygonZoom] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDobraduraOpen, setIsDobraduraOpen] = useState<boolean>(false);
  const [isModoTracadoOpen, setIsModoTracadoOpen] = useState<boolean>(false);
  const [isRelatorioOpen, setIsRelatorioOpen] = useState<boolean>(false);
  const [showDobraduraHint, setShowDobraduraHint] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    // Open tutorial automatically if student has not completed it in current session
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('expedicao_tutorial_visto');
    }
    return true;
  });

  // Challenge answer state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<{
    isCorrect: boolean;
    text: string;
  } | null>(null);
  const [showVictoryBanner, setShowVictoryBanner] = useState<boolean>(false);

  const completedInCurrentLevel = solvedPolygonsByLevel[currentLevel.id] || [];
  const isCurrentPolygonSolved = completedInCurrentLevel.includes(activePolygon.id);
  const isIslandPortalActive = completedInCurrentLevel.length === currentLevel.polygons.length;

  const totalStars = Object.values(solvedPolygonsByLevel).reduce(
    (acc, list) => acc + list.length,
    0
  );
  const maxStars = ISLAND_LEVELS.reduce((acc, lvl) => acc + lvl.polygons.length, 0);

  // Select level handler
  const handleSelectLevel = useCallback((idx: number) => {
    sound.playClick();
    const nextLvl = ISLAND_LEVELS[idx];
    setCurrentLevelIdx(idx);
    setActivePolygonId(nextLvl.polygons[0].id);
    setActiveVertexId(nextLvl.polygons[0].vertices[0].id);
    setPolygonRotationY(0);
    setSelectedOptionId(null);
    setChallengeFeedback(null);
    setShowVictoryBanner(false);
  }, []);

  // Select polygon handler
  const handleSelectPolygon = useCallback(
    (polyId: string) => {
      const poly = currentLevel.polygons.find((p) => p.id === polyId);
      if (!poly) return;
      setActivePolygonId(poly.id);
      setActiveVertexId(poly.vertices[0].id);
      setPolygonRotationY(0);
      setSelectedOptionId(null);
      setChallengeFeedback(null);
      setCameraMode('inspecao');
    },
    [currentLevel]
  );

  // Select vertex handler with particle burst on correct right angles
  const handleSelectVertex = useCallback(
    (vertexId: string, screenPos?: { x: number; y: number }) => {
      const v = activePolygon.vertices.find((item) => item.id === vertexId);
      if (!v) return;
      sound.playVertexSelect(v.isRight);
      setActiveVertexId(v.id);
      setInspectedVertices((prev) => ({
        ...prev,
        [`${activePolygon.id}-${v.id}`]: true,
      }));

      // Particle explosion around the vertex if it is a correct Right Angle (90°)
      if (v.isRight) {
        let originX = 0.5;
        let originY = 0.45;
        if (screenPos && typeof window !== 'undefined') {
          originX = Math.max(0.1, Math.min(0.9, screenPos.x / window.innerWidth));
          originY = Math.max(0.1, Math.min(0.9, screenPos.y / window.innerHeight));
        }

        confetti({
          particleCount: 35,
          spread: 60,
          startVelocity: 24,
          ticks: 120,
          origin: { x: originX, y: originY },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#fde047', '#ffffff'],
          shapes: ['circle', 'square'],
          scalar: 0.8,
          disableForReducedMotion: true,
        });
      }
    },
    [activePolygon]
  );

  // Mark initial vertex inspected
  useEffect(() => {
    setInspectedVertices((prev) => ({
      ...prev,
      [`${activePolygon.id}-${activeVertex.id}`]: true,
    }));
  }, [activePolygon.id, activeVertex.id]);

  // Track user activity to trigger educational hint on vertex inactivity (30s threshold)
  const resetVertexInactivity = useCallback(() => {
    setShowDobraduraHint(false);
  }, []);

  useEffect(() => {
    // Only track inactivity when in 'inspecionar' mode and modal is closed
    if (dockTab !== 'inspecionar' || isDobraduraOpen) {
      setShowDobraduraHint(false);
      return;
    }

    setShowDobraduraHint(false);
    const timer = setTimeout(() => {
      setShowDobraduraHint(true);
    }, 30000); // 30 seconds of inactivity on this vertex

    return () => clearTimeout(timer);
  }, [activeVertex.id, activePolygon.id, dockTab, isDobraduraOpen, polygonRotationY, polygonZoom, showEsquadro3D]);

  // Keyboard shortcut 'H' to collapse/expand bottom dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      resetVertexInactivity();
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resetVertexInactivity]);

  // Submit challenge option
  const handleAnswerChallenge = (optionId: string) => {
    const option = activePolygon.challenge.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedOptionId(optionId);
    setChallengeFeedback({
      isCorrect: option.isCorrect,
      text: option.feedback,
    });

    if (option.isCorrect) {
      const alreadySolved = (solvedPolygonsByLevel[currentLevel.id] || []).includes(
        activePolygon.id
      );
      const updatedList = alreadySolved
        ? solvedPolygonsByLevel[currentLevel.id]
        : [...(solvedPolygonsByLevel[currentLevel.id] || []), activePolygon.id];

      setSolvedPolygonsByLevel((prev) => ({
        ...prev,
        [currentLevel.id]: updatedList,
      }));

      if (updatedList.length === currentLevel.polygons.length) {
        sound.playPortalActivate();
        setShowVictoryBanner(true);
        setCameraMode('ilha');
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } else {
        sound.playSuccess();
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
        });
      }
    } else {
      sound.playError();
    }
  };

  const toggleMute = () => {
    sound.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Compute performance metrics for Right Angles vs Non-Right Angles across all 5 phases
  const angleStatsByPhase = ISLAND_LEVELS.map((lvl) => {
    const solvedIds = solvedPolygonsByLevel[lvl.id] || [];
    let totalRight = 0;
    let identifiedRight = 0;
    let totalNonRight = 0;
    let identifiedNonRight = 0;

    lvl.polygons.forEach((poly) => {
      const isPolySolved = solvedIds.includes(poly.id);
      poly.vertices.forEach((v) => {
        const isVertexIdentified =
          isPolySolved || Boolean(inspectedVertices[`${poly.id}-${v.id}`]);
        if (v.isRight) {
          totalRight += 1;
          if (isVertexIdentified) identifiedRight += 1;
        } else {
          totalNonRight += 1;
          if (isVertexIdentified) identifiedNonRight += 1;
        }
      });
    });

    const rightPct = totalRight > 0 ? Math.round((identifiedRight / totalRight) * 100) : 0;
    const nonRightPct =
      totalNonRight > 0 ? Math.round((identifiedNonRight / totalNonRight) * 100) : 0;

    return {
      levelId: lvl.id,
      shortLabel: `F${lvl.id}`,
      totalRight,
      identifiedRight,
      totalNonRight,
      identifiedNonRight,
      rightPct,
      nonRightPct,
    };
  });

  const globalRightTotal = angleStatsByPhase.reduce((acc, s) => acc + s.totalRight, 0);
  const globalRightIdentified = angleStatsByPhase.reduce((acc, s) => acc + s.identifiedRight, 0);
  const globalRightPct =
    globalRightTotal > 0 ? Math.round((globalRightIdentified / globalRightTotal) * 100) : 0;

  const globalNonRightTotal = angleStatsByPhase.reduce((acc, s) => acc + s.totalNonRight, 0);
  const globalNonRightIdentified = angleStatsByPhase.reduce(
    (acc, s) => acc + s.identifiedNonRight,
    0
  );
  const globalNonRightPct =
    globalNonRightTotal > 0
      ? Math.round((globalNonRightIdentified / globalNonRightTotal) * 100)
      : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. Top Navigation Bar following strict 3-Zone Contract */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 py-3 bg-slate-950/95 border-b border-slate-800">
        {/* Zone 1: Brand Title (Single text element, one line) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setCameraMode('ilha');
          }}
          className="text-base md:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          A Expedição dos Guardiões dos Ângulos
        </a>

        {/* Zone 2: 5 Island Stage Links (Single-line text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {ISLAND_LEVELS.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIdx;
            const doneCount = (solvedPolygonsByLevel[lvl.id] || []).length;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(idx)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                  isCurrent
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Fase {lvl.id} ({doneCount}/3)
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Button + Quick Help */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setIsTutorialOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="Abrir Tutorial Interativo com Guia e Termo"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Tutorial</span>
          </button>
          <button
            onClick={() => {
              sound.playToolEquip();
              setIsDobraduraOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Oficina de Dobradura
          </button>
        </div>
      </header>

      {/* 2. Isolated Full-Viewport 3D Scene Container (100% Unobstructed Center) */}
      <main className="w-full h-full pt-14">
        <ThreeScene
          level={currentLevel}
          activePolygon={activePolygon}
          activeVertex={activeVertex}
          completedPolygonIds={completedInCurrentLevel}
          cameraMode={cameraMode}
          showEsquadro3D={showEsquadro3D}
          polygonRotationY={polygonRotationY}
          polygonZoom={polygonZoom}
          onSelectPolygon={handleSelectPolygon}
          onSelectVertex={handleSelectVertex}
        />
      </main>

      {/* Subtle Top-Left Mission & Star Telemetry Bar (Non-obstructive) */}
      <div className="fixed top-16 left-6 z-20 pointer-events-none flex flex-col gap-1">
        <div className="pointer-events-auto inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/95 border border-slate-800 text-xs text-slate-300 shadow-lg">
          <span className="font-semibold text-white">{currentLevel.title}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 font-mono-tabular flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {totalStars}/{maxStars} Estrelas
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-mono-tabular">
            Portal {completedInCurrentLevel.length}/3
          </span>
        </div>
      </div>

      {/* Island Portal Restored Banner */}
      {showVictoryBanner && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
          <div className="rounded-2xl bg-slate-900/95 border-2 border-emerald-400 p-5 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <Award className="w-5 h-5" />
              <span>PORTAL DA FASE {currentLevel.id} REATIVADO!</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              Neblino recuou! Você identificou todos os ângulos retos e não retos das figuras
              poligonais de {currentLevel.title}!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowVictoryBanner(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                Continuar Explorando
              </button>
              {currentLevelIdx < ISLAND_LEVELS.length - 1 ? (
                <button
                  onClick={() => handleSelectLevel(currentLevelIdx + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Viajar para a Fase {currentLevel.id + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
                    setShowVictoryBanner(false);
                    setIsRelatorioOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 transition-colors whitespace-nowrap shrink-0"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Emitir Relatório Final em PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95vw] max-w-[960px] transition-transform duration-200 ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Handle */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              sound.playClick();
              setIsDockCollapsed((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-slate-900 border border-b-0 border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Mostrar Painel do Guardião (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Ocultar Painel para Ver Cena 3D (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Bottom Dock Surface (Solid high-contrast surface without backdrop-filter stall) */}
        <div className="rounded-2xl bg-slate-900/95 border border-slate-700 p-4 shadow-2xl text-slate-100">
          {/* Top Row: Polygon Switcher + Dock Mode Tabs + Camera & Utility Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Polygon Selection Buttons on Current Island */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {currentLevel.polygons.map((poly) => {
                const isSelected = poly.id === activePolygon.id;
                const isSolved = completedInCurrentLevel.includes(poly.id);
                return (
                  <button
                    key={poly.id}
                    onClick={() => {
                      sound.playClick();
                      handleSelectPolygon(poly.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {isSolved && (
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-slate-950' : 'text-emerald-400'
                        }`}
                      />
                    )}
                    <span>{poly.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode Switcher Tabs (Inspecionar Vértices | Desafio do Portal | Guia da Ilha) */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  sound.playClick();
                  setDockTab('inspecionar');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  dockTab === 'inspecionar'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Inspecionar Vértices
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setDockTab('desafio');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  dockTab === 'desafio'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2. Desafio do Portal {isCurrentPolygonSolved ? '✓' : ''}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setDockTab('missao');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  dockTab === 'missao'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Missão & Fases
              </button>
            </div>

            {/* Camera & Audio Quick Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsTutorialOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 transition-colors whitespace-nowrap shrink-0"
                title="Abrir tutorial com regras e termo de leitura"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Tutorial</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCameraMode((m) =>
                    m === 'inspecao' ? 'ilha' : m === 'ilha' ? 'topo' : 'inspecao'
                  );
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
                title="Alternar câmera"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Câmera:{' '}
                  {cameraMode === 'inspecao'
                    ? 'Perto'
                    : cameraMode === 'ilha'
                    ? 'Ilha'
                    : 'Topo'}
                </span>
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* TAB 1: VERTEX & ANGLE INSPECTOR */}
          {dockTab === 'inspecionar' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 items-center">
              {/* Left 5 cols: Vertex Selector & 3D Manipulation Controls */}
              <div className="md:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Selecione um Vértice da Figura:</span>
                  <span className="font-mono-tabular text-slate-300">
                    {activePolygon.sidesCount} lados · {activePolygon.vertices.length} vértices
                  </span>
                </div>

                {/* Vertex Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePolygon.vertices.map((v) => {
                    const isCurrentV = v.id === activeVertex.id;
                    const wasSeen = inspectedVertices[`${activePolygon.id}-${v.id}`];
                    return (
                      <button
                        key={v.id}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          handleSelectVertex(v.id, {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          isCurrentV
                            ? 'bg-sky-400 text-slate-950 shadow-sm'
                            : wasSeen
                            ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:bg-slate-700'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Vértice {v.id}
                      </button>
                    );
                  })}
                </div>

                {/* 3D Object Manipulation: Rotate, Zoom, 3D Esquadro Toggle */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      sound.playToolEquip();
                      setShowEsquadro3D((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      showEsquadro3D
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Esquadro 3D: {showEsquadro3D ? 'Visível' : 'Oculto'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setPolygonRotationY((r) => r - Math.PI / 6);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors whitespace-nowrap shrink-0"
                    title="Girar figura para a esquerda"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Girar</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setPolygonRotationY((r) => r + Math.PI / 6);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors whitespace-nowrap shrink-0"
                    title="Girar figura para a direita"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setPolygonZoom((z) => Math.min(1.45, +(z + 0.15).toFixed(2)));
                      setCameraMode('inspecao');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                    title="Aproximar figura"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setPolygonZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)));
                      setCameraMode('inspecao');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                    title="Afastar figura"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right 7 cols: Active Vertex Diagnostic Readout */}
              <div className="md:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-3.5 flex flex-col justify-between gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{activeVertex.label}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono-tabular text-sm font-bold text-amber-400">
                      Medida: {activeVertex.angleDeg}°
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span
                      className={`text-xs font-bold ${
                        activeVertex.isRight
                          ? 'text-emerald-400'
                          : activeVertex.angleDeg < 90
                          ? 'text-sky-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeVertex.isRight
                        ? '■ ÂNGULO RETO (90°)'
                        : activeVertex.angleDeg < 90
                        ? '▲ ÂNGULO NÃO RETO (Agudo < 90°)'
                        : '◆ ÂNGULO NÃO RETO (Obtuso > 90°)'}
                    </span>
                  </div>

                  <span className="text-xs font-mono-tabular text-slate-400">
                    Lados: {activeVertex.adjacentSidesLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeVertex.esquadroTip}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <div className="relative inline-flex items-center">
                    <button
                      onClick={() => {
                        setShowDobraduraHint(false);
                        sound.playToolEquip();
                        setIsDobraduraOpen(true);
                      }}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                        showDobraduraHint
                          ? 'animate-hint-nudge bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300'
                          : 'text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20'
                      }`}
                    >
                      <Layers className={`w-3.5 h-3.5 ${showDobraduraHint ? 'animate-bounce' : ''}`} />
                      <span>Simular Dobradura neste Vértice</span>
                      {showDobraduraHint && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-amber-400 border border-amber-400/50">
                          Dica
                        </span>
                      )}
                    </button>
                    {showDobraduraHint && (
                      <span className="hidden sm:inline-block ml-2 text-[11px] text-amber-300 animate-pulse font-medium">
                        Dúvida sobre o ângulo? Use a dobradura!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playToolEquip();
                        setIsModoTracadoOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-500/40 hover:bg-sky-900/60 text-sky-300 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
                      title="Desenhe sobre a figura para destacar manualmente os ângulos retos"
                    >
                      <PenTool className="w-3.5 h-3.5 text-sky-400" />
                      <span>Modo de Traçado</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowDobraduraHint(false);
                        sound.playClick();
                        setDockTab('desafio');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Responder Desafio da Figura</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PORTAL ACTIVATION CHALLENGE */}
          {dockTab === 'desafio' && (
            <div className="pt-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">
                    {activePolygon.challenge.question}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {isCurrentPolygonSolved ? 'Desafio Concluído ★' : 'Valendo 1 Estrela do Portal'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {activePolygon.challenge.options.map((opt) => {
                  const isPicked = selectedOptionId === opt.id;
                  let btnStyle =
                    'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600';
                  if (isPicked) {
                    btnStyle = opt.isCorrect
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                      : 'bg-rose-950/90 border-rose-400 text-rose-200';
                  } else if (isCurrentPolygonSolved && opt.isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerChallenge(opt.id)}
                      className={`text-left p-3 rounded-xl border text-xs leading-relaxed font-medium transition-colors ${btnStyle}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {challengeFeedback && (
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs ${
                    challengeFeedback.isCorrect
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                  }`}
                >
                  <span>{challengeFeedback.text}</span>
                  {challengeFeedback.isCorrect && (
                    <button
                      onClick={() => {
                        // Jump to next unsolved polygon on this island, or next island
                        const nextUnsolved = currentLevel.polygons.find(
                          (p) =>
                            p.id !== activePolygon.id &&
                            !completedInCurrentLevel.includes(p.id)
                        );
                        if (nextUnsolved) {
                          handleSelectPolygon(nextUnsolved.id);
                          setDockTab('inspecionar');
                        } else if (currentLevelIdx < ISLAND_LEVELS.length - 1) {
                          handleSelectLevel(currentLevelIdx + 1);
                          setDockTab('inspecionar');
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                    >
                      Próximo Desafio →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MISSION GUIDE, LEVEL SWITCHER & ANGLE PERFORMANCE BAR CHART */}
          {dockTab === 'missao' && (
            <div className="pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left 6 cols: Narrative Guide & Island Phase Selector */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-amber-400">
                    {currentLevel.bnccFocus}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong>Mestre Esquadro:</strong> “{currentLevel.guardianGreeting}”
                  </p>
                  <p className="text-xs text-purple-300 leading-relaxed">
                    <strong>Vilão Neblino:</strong> “{currentLevel.neblinoTaunt}”
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {ISLAND_LEVELS.map((lvl, idx) => {
                    const done = (solvedPolygonsByLevel[lvl.id] || []).length;
                    const active = idx === currentLevelIdx;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          handleSelectLevel(idx);
                          setDockTab('inspecionar');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        Ilha {lvl.id} ({done}/3 ★)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 6 cols: Performance Bar Chart Panel (Retos vs Não Retos across all phases) */}
              <div className="lg:col-span-6 rounded-xl bg-slate-950 border border-slate-800 p-3.5 flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Desempenho: Ângulos Retos vs. Não Retos (Fases 1–5)</span>
                  </div>
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    Total: {globalRightIdentified + globalNonRightIdentified}/
                    {globalRightTotal + globalNonRightTotal} vértices
                  </span>
                </div>

                {/* Global Comparative Horizontal Bars */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">
                        ■ Ângulos Retos (90°)
                      </span>
                      <span className="font-mono-tabular text-slate-300">
                        {globalRightIdentified}/{globalRightTotal} ({globalRightPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${globalRightPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-sky-400">
                        ▲ Ângulos Não Retos (≠ 90°)
                      </span>
                      <span className="font-mono-tabular text-slate-300">
                        {globalNonRightIdentified}/{globalNonRightTotal} ({globalNonRightPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-sky-400 transition-all duration-300"
                        style={{ width: `${globalNonRightPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Per-Phase Grouped Vertical Mini Bar Chart (F1 to F5) */}
                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-900">
                  {angleStatsByPhase.map((stat) => (
                    <div
                      key={stat.levelId}
                      className="flex flex-col items-center gap-1 bg-slate-900/60 rounded-lg px-2 py-1.5 border border-slate-800/80"
                    >
                      <div className="w-full h-10 flex items-end justify-center gap-1.5">
                        {/* Right Angle Bar */}
                        <div className="w-2.5 h-full bg-slate-950 rounded-sm flex items-end overflow-hidden">
                          <div
                            className="w-full bg-emerald-500 transition-all duration-300"
                            style={{ height: `${Math.max(stat.rightPct, 8)}%` }}
                            title={`Fase ${stat.levelId} Retos: ${stat.identifiedRight}/${stat.totalRight} (${stat.rightPct}%)`}
                          />
                        </div>
                        {/* Non-Right Angle Bar */}
                        <div className="w-2.5 h-full bg-slate-950 rounded-sm flex items-end overflow-hidden">
                          <div
                            className="w-full bg-sky-400 transition-all duration-300"
                            style={{ height: `${Math.max(stat.nonRightPct, 8)}%` }}
                            title={`Fase ${stat.levelId} Não Retos: ${stat.identifiedNonRight}/${stat.totalNonRight} (${stat.nonRightPct}%)`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full text-[10px] font-mono-tabular text-slate-400">
                        <span className="font-semibold text-slate-200">{stat.shortLabel}</span>
                        <span>
                          {stat.identifiedRight + stat.identifiedNonRight}/
                          {stat.totalRight + stat.totalNonRight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PDF Portfolio Action Button */}
                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsRelatorioOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-950" />
                    <span>Baixar Relatório de Desempenho em PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Dobradura & Esquadro Workshop Modal */}
      <DobraduraModal
        isOpen={isDobraduraOpen}
        onClose={() => setIsDobraduraOpen(false)}
        activePolygon={activePolygon}
        activeVertex={activeVertex}
      />

      {/* Modo de Traçado Interativo: Desenhe e Destaque Ângulos Retos */}
      <ModoTracadoModal
        isOpen={isModoTracadoOpen}
        onClose={() => setIsModoTracadoOpen(false)}
        polygon={activePolygon}
      />

      {/* Interactive Tutorial Modal with 'Li e Entendi' Checkbox */}
      <InteractiveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('expedicao_tutorial_visto', 'true');
          }
          setIsTutorialOpen(false);
        }}
      />

      {/* Relatório de Desempenho em PDF para Portfólio Digital */}
      <RelatorioDesempenhoModal
        isOpen={isRelatorioOpen}
        onClose={() => setIsRelatorioOpen(false)}
        solvedPolygonsByLevel={solvedPolygonsByLevel}
        inspectedVertices={inspectedVertices}
        totalStars={totalStars}
        maxStars={maxStars}
      />
    </div>
  );
}

export default App;
