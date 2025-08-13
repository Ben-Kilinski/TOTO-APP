import { useEffect, useMemo, useRef, useState } from "react";
import { foodMenu } from "../data/MenuData";
import type { Dish } from "../data/MenuData";

interface FoodCarouselProps {
  language: "he" | "pt" | "en";
}

type Dir = -1 | 0 | 1;

// Medidas base do cartão (não mexemos no layout interno)
const SLOT_W = 340;                 // largura fixa de cada cartão (sem reflow)
const SLOT_H = 600;                 // altura fixa
const GAP_DESKTOP = 24;             // espaçamento entre cartões (desktop)
const DURATION = 500;               // ms
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"; // ease-out suave

export default function FoodCarousel({ language }: FoodCarouselProps) {
  const base = foodMenu as Dish[];
  const N = base.length;

  // Track com TODOS os cartões: A | A | A
  const track = useMemo(() => [...base, ...base, ...base], [base]);
  const START = N; // começamos no bloco do meio

  // pos = índice do item central visível dentro do track 3N
  const [pos, setPos] = useState(START);
  const [, setDir] = useState<Dir>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapOff, setSnapOff] = useState(false); // true = sem transition (para reset invisível)

  // --- Responsividade: mobile = 1 cartão; desktop = 3 cartões ---
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const GAP = isMobile ? 0 : GAP_DESKTOP; // no mobile sem “vazar” cartões
  const STAGE_W = isMobile ? SLOT_W : 3 * SLOT_W + 2 * GAP;

  const go = (delta: number) => {
    if (isAnimating) return;
    setDir(delta as Dir);
    setIsAnimating(true);
    setPos((p) => p + delta);
  };
  const handleNext = () => go(+1);
  const handlePrev = () => go(-1);

  // Centro do palco (px)
  const stageCenterPx = isMobile ? SLOT_W / 2 : SLOT_W + GAP + SLOT_W / 2;

  // Centro do item 'pos' (px) dentro da track
  const itemCenterPx = pos * (SLOT_W + GAP) + SLOT_W / 2;

  // =========================
  // Touch: arraste + swipe
  // =========================
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // px aplicados no translate
  const axisRef = useRef<null | "x" | "y">(null);

  const SWIPE_MIN = Math.max(50, Math.floor(SLOT_W * 0.2)); // limiar p/ mudar de card
  const ACTIVATE_MIN = 8; // px para decidir eixo
  const MAX_DRAG = Math.floor(SLOT_W * 0.6); // trava o arraste visual

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
    axisRef.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!startRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;

    if (!axisRef.current) {
      if (Math.abs(dx) < ACTIVATE_MIN && Math.abs(dy) < ACTIVATE_MIN) return;
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (axisRef.current === "y") {
      // gesto vertical → libera o scroll do conteúdo do cartão
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    // gesto horizontal → segue o dedo
    const clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx));
    setIsDragging(true);
    setDragOffset(clamped);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startRef.current) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - startRef.current.x;

    startRef.current = null;

    if (axisRef.current !== "x") {
      // não foi swipe horizontal
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    // decide navegação
    if (dx > SWIPE_MIN) {
      go(-1); // swipe para direita → volta
    } else if (dx < -SWIPE_MIN) {
      go(+1); // swipe para esquerda → avança
    }

    // reset do arraste (com um snap leve quando não navegou)
    setIsDragging(false);
    setDragOffset(0);
    axisRef.current = null;
  };

  // Translate necessário para colocar o item 'pos' no centro do palco
  const baseTranslate = stageCenterPx - itemCenterPx;
  const trackTranslate = baseTranslate + dragOffset;

  // Encerrar transição e wrap invisível para manter pos no bloco do meio
  const onTrackEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
    if (!isAnimating || e.propertyName !== "transform") return;
    setIsAnimating(false);
    setDir(0);

    let newPos = pos;
    if (pos < N) newPos = pos + N;          // saltar +N
    else if (pos >= 2 * N) newPos = pos - N; // saltar -N

    if (newPos !== pos) {
      setSnapOff(true);
      setPos(newPos);
      requestAnimationFrame(() => setSnapOff(false));
    }
  };

  // Escala/Opacidade por distância ao centro
  function visualFor(index: number) {
    const dist = index - pos; // -∞..+∞
    if (isMobile) {
      // mobile: só 1 cartão visível mesmo
      if (dist === 0) return { scale: 1.0, opacity: 1.0, z: 30 };
      return { scale: 0.95, opacity: 0.0, z: 0 };
    }
    // desktop: 3 cartões (centro maior, laterais menores)
    if (dist === 0) return { scale: 1.1, opacity: 1.0, z: 30 };
    if (dist === -1 || dist === 1) return { scale: 0.75, opacity: 0.5, z: 20 };
    return { scale: 0.9, opacity: 0.0, z: 10 };
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative">
      {/* Controles */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400"
        aria-label="Anterior"
      >
        ❮
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400"
        aria-label="Próximo"
      >
        ❯
      </button>

      {/* Palco: mobile=1; desktop=3; overflow oculto */}
      <div
        className="overflow-hidden"
        style={{ width: STAGE_W, height: SLOT_H, touchAction: "pan-y" }} // permite scroll vertical dentro do cartão
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track com TODOS os cartões (A|A|A). Move horizontalmente. */}
        <div
          className="flex items-stretch"
          style={{
            gap: GAP,
            transform: `translateX(${trackTranslate}px)`,
            transition: snapOff
              ? "none"
              : isDragging
              ? "none" // enquanto arrasta, segue o dedo sem animação
              : isAnimating
              ? `transform ${DURATION}ms ${EASING}` // navegação
              : "transform 200ms ease-out", // snap suave quando solta sem trocar de card
            willChange: "transform",
          }}
          onTransitionEnd={onTrackEnd}
        >
          {track.map((dish, i) => {
            const { scale, opacity, z } = visualFor(i);
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{ width: SLOT_W, height: SLOT_H, zIndex: z }}
              >
                {/* Card interno escala/opacity — texto não reflowa */}
                <div
                  className="rounded-xl border border-zinc-700 bg-zinc-800 text-white shadow-md overflow-hidden origin-center group"
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${scale})`,
                    opacity,
                    transition: `transform ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
                    willChange: "transform, opacity",
                  }}
                >
                  <img
                    src={dish.image}
                    alt={dish[language]}
                    className={`w-full ${isMobile ? "h-44" : "h-56"} object-cover`}
                    draggable={false}
                  />

                  <div className="p-6 flex flex-col justify-start h-[calc(100%-224px)] gap-4 overflow-auto scroll-slim pb-12">
                    {/* Título maior e com cor diferente */}
                    <h2
                      className={`text-2xl font-extrabold tracking-tight text-rose-400 ${
                        language === "he" ? "text-right" : "text-left"
                      }`}
                    >
                      {dish[language]}
                    </h2>

                    {/* Texto em bloco; RTL para he, LTR para pt/en; sem sobras de linha */}
                    <div
                      dir={language === "he" ? "rtl" : "ltr"}
                      className={`space-y-4 ${
                        language === "he" ? "text-right" : "text-left"
                      } text-justify`}
                    >
                      {dish.description[language].map((blk, j) => (
                        <div key={j}>
                          <div className="text-sm font-semibold uppercase tracking-wide text-amber-300 mb-1">
                            {blk.title}
                          </div>
                          <div
                            className="text-base text-zinc-100 leading-relaxed"
                            style={{ whiteSpace: "normal" }}
                          >
                            {blk.text}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
