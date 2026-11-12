import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  Square,
  Undo2,
} from 'lucide-react';
import { IslandPolygonData } from '../data/levels';
import { sound } from '../utils/sound';

interface ModoTracadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  polygon: IslandPolygonData;
}

interface StrokePoint {
  x: number;
  y: number;
}

export const ModoTracadoModal: React.FC<ModoTracadoModalProps> = ({
  isOpen,
  onClose,
  polygon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<StrokePoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#10b981'); // Emerald 90° highlighter
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [markedRightAngleCount, setMarkedRightAngleCount] = useState<number>(0);
  const [hasCheckedAngles, setHasCheckedAngles] = useState<boolean>(false);

  // Real number of right angles on this polygon
  const actualRightAngles = polygon.vertices.filter((v) => v.isRight).length;

  // Viewbox setup for polygon in 2D canvas
  const canvasWidth = 560;
  const canvasHeight = 440;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2 + 10;
  const scale = 72; // pixels per unit

  // Transform polygon local coordinate to canvas coordinates
  const toCanvasCoords = (lx: number, ly: number) => ({
    x: centerX + lx * scale,
    y: centerY - ly * scale, // SVG / Canvas Y is inverted
  });

  // Redraw canvas content (polygon outline, grid, and user strokes)
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Subtle graph grid background
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // 2. Draw Polygon Base Body
    ctx.beginPath();
    polygon.vertices.forEach((v, idx) => {
      const pt = toCanvasCoords(v.x, v.y);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fill();

    ctx.strokeStyle = polygon.colorHex;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 3. Draw Polygon Vertices & Letter Badges
    polygon.vertices.forEach((v) => {
      const pt = toCanvasCoords(v.x, v.y);

      // Vertex circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = polygon.colorHex;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vertex label
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Offset label slightly outside vertex
      const dirX = v.x === 0 ? 0 : v.x > 0 ? 16 : -16;
      const dirY = v.y === 0 ? -16 : v.y > 0 ? -18 : 18;
      ctx.fillText(v.id, pt.x + dirX, pt.y + dirY);
    });

    // 4. Render All User Hand-drawn Strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    allStrokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [isOpen, strokes, currentStroke, selectedColor, strokeWidth]);

  if (!isOpen) return null;

  // Pointer drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentStroke([{ x, y }]);
    sound.playClick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentStroke((prev) => (prev ? [...prev, { x, y }] : [{ x, y }]));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentStroke && currentStroke.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleClearStrokes = () => {
    sound.playClick();
    setStrokes([]);
    setCurrentStroke(null);
    setHasCheckedAngles(false);
  };

  const handleUndo = () => {
    sound.playClick();
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleCheckDrawing = () => {
    sound.playSuccess();
    setHasCheckedAngles(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400">
                Prática Interativa BNCC EF04MA18 · Traçado de Ângulos
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Modo de Traçado: {polygon.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Fechar Modo de Traçado"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar instructions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-slate-300">
          <p>
            Desenhe o símbolo de canto reto (<strong className="text-emerald-400">■ quadrado ou L</strong>) sobre os vértices que você acredita medirem <strong>90°</strong>!
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Desfazer</span>
            </button>
            <button
              onClick={handleClearStrokes}
              disabled={strokes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Traço</span>
            </button>
          </div>
        </div>

        {/* Interactive Drawing Canvas Stage */}
        <div className="mt-3 flex justify-center items-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full max-h-[380px] object-contain cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Validation Overlay Banner */}
          {hasCheckedAngles && (
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/95 border border-emerald-500/60 p-3 shadow-xl backdrop-blur-sm flex items-center justify-between gap-3">
              <div className="text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Traçado Concluído com Sucesso!</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Esta figura possui exatamente <strong>{actualRightAngles} ângulo{actualRightAngles === 1 ? '' : 's'} reto{actualRightAngles === 1 ? '' : 's'}</strong> ({polygon.vertices.filter(v => v.isRight).map(v => v.id).join(', ') || 'nenhum'}).
                </p>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 transition-colors"
              >
                Voltar à Exploração
              </button>
            </div>
          )}
        </div>

        {/* Color Palette & Stroke Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Cor do Marcador:</span>
            {[
              { color: '#10b981', label: 'Verde Ângulo Reto' },
              { color: '#f59e0b', label: 'Dourado Esquadro' },
              { color: '#38bdf8', label: 'Azul Celeste' },
              { color: '#f43f5e', label: 'Rosa Destaque' },
            ].map(({ color, label }) => (
              <button
                key={color}
                onClick={() => {
                  sound.playClick();
                  setSelectedColor(color);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  selectedColor === color
                    ? 'border-white scale-110 shadow-md'
                    : 'border-slate-800 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Espessura:</span>
              {[4, 6, 10].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    strokeWidth === w
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w === 4 ? 'Fina' : w === 6 ? 'Média' : 'Grossa'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckDrawing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verificar Meus Traçados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
