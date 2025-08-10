import { useMemo, useState } from "react";
import { foodMenu } from "../data/MenuData";
import type { Dish } from "../data/MenuData";

interface FoodCarouselProps {
  language: "he" | "pt" | "en";
}

type Dir = -1 | 0 | 1;

const SLOT_W = 340;                 // largura fixa de cada cartão (sem reflow)
const SLOT_H = 600;                 // altura fixa
const GAP = 24;                     // espaçamento entre os cartões
const DURATION = 500;               // ms
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"; // ease-out suave

export default function FoodCarousel({ language }: FoodCarouselProps) {
  const base = foodMenu as Dish[];
  const N = base.length;

  // Track com TODOS os cartões: A | A | A  (tudo no DOM)
  const track = useMemo(() => [...base, ...base, ...base], [base]);
  const START = N; // começamos no bloco do meio

  // pos = índice do item central visível dentro do track 3N
  const [pos, setPos] = useState(START);
  const [dir, setDir] = useState<Dir>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapOff, setSnapOff] = useState(false); // true = sem transition (para o reset invisível)

  const handleNext = () => {
    if (isAnimating) return;
    setDir(1);
    setIsAnimating(true);
    setPos((p) => p + 1);
  };
  const handlePrev = () => {
    if (isAnimating) return;
    setDir(-1);
    setIsAnimating(true);
    setPos((p) => p - 1);
  };

  // Palco visível (3 cartões): largura exata
  const STAGE_W = 3 * SLOT_W + 2 * GAP;

  // Centro do palco (pixel) = centro do cartão do meio (segundo dos 3)
  const stageCenterPx = SLOT_W + GAP + SLOT_W / 2;

  // Centro do item 'pos' (em px) dentro da track (cada slot = SLOT_W + GAP)
  const itemCenterPx = pos * (SLOT_W + GAP) + SLOT_W / 2;

  // Translate necessário para colocar o item 'pos' no centro do palco
  const trackTranslate = stageCenterPx - itemCenterPx;

  // Encerrar transição e fazer wrap invisível para manter pos no bloco do meio
  const onTrackEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
    if (!isAnimating || e.propertyName !== "transform") return;
    setIsAnimating(false);
    setDir(0);

    // Se saiu do bloco central, traz de volta sem transição
    let newPos = pos;
    if (pos < N) newPos = pos + N;       // saltar +N
    else if (pos >= 2 * N) newPos = pos - N; // saltar -N

    if (newPos !== pos) {
      setSnapOff(true); // corta a transição
      setPos(newPos);
      // reabilita a transição no próximo frame
      requestAnimationFrame(() => setSnapOff(false));
    }
  };

  // Escala/Opacidade por distância ao centro (aplica em TODOS os cartões)
  function visualFor(index: number) {
    const dist = index - pos; // -∞..+∞
    // dist 0 = centro, ±1 = laterais visíveis, outros = fora
    if (dist === 0) return { scale: 1.1, opacity: 1.0, z: 30 };
    if (dist === -1 || dist === 1) return { scale: 0.95, opacity: 0.6, z: 20 };
    return { scale: 0.9, opacity: 0.0, z: 10 };
  }

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex items-center justify-center bg-black relative">
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

      {/* Palco: apenas 3 cartões visíveis; overflow oculto */}
      <div
        className="overflow-hidden"
        style={{ width: STAGE_W, height: SLOT_H }}
      >
        {/* Track com TODOS os cartões (A|A|A). Move horizontalmente. */}
        <div
          className="flex items-stretch"
          style={{
            gap: GAP,
            transform: `translateX(${trackTranslate}px)`,
            transition:
              snapOff
                ? "none"
                : isAnimating
                ? `transform ${DURATION}ms ${EASING}`
                : undefined,
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
                  className="rounded-xl border border-zinc-700 bg-zinc-800 text-white shadow-md overflow-hidden origin-center"
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
                    className="w-full h-56 object-cover"
                    draggable={false}
                  />
                  <div className="p-4 flex flex-col justify-start h-[calc(100%-224px)]">
                    <h2
                      className={`text-lg font-bold mb-2 ${
                        language === "he" ? "text-right" : "text-left"
                      }`}
                    >
                      {dish[language]}
                    </h2>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap overflow-auto">
                      {dish.description[language]}
                    </p>
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
