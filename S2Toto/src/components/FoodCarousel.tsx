  import { useMemo, useRef, useState } from "react";
  import { foodMenu } from "../data/MenuData";

  type Lang = "he" | "pt" | "en";

  interface FoodCarouselProps {
    language: Lang;
  }

  /**
   * Palco fixo mostra 3 cartas (left, center, right)
   * A faixa contém 5 cartas (offL, left, center, right, offR)
   * Movemos a FAIXA com translateX; ao fim da transição rotacionamos o centro.
   *
   * Textos NÃO se mexem: largura/posição do card são fixas; só muda font-size.
   * Laterais menores: usamos SCALE suave, mantendo o slot (CARD_W x CARD_H) fixo.
   */
  export default function FoodCarousel({ language }: FoodCarouselProps) {
    // índice do item central dentro do menu completo
    const [centerIndex, setCenterIndex] = useState(0);
    // estado de animação: deslocamento atual da faixa em px
    const [offset, setOffset] = useState(0);
    // trava para não spammar cliques durante animação
    const [isAnimating, setAnimating] = useState(false);

    // ====== Constantes de layout (ajuste à vontade) ============================
    const CARD_W = 360; // largura fixa do SLOT de cada carta (px)
    const CARD_H = 560; // altura fixa do SLOT (px)
    const GAP = 24;     // espaço entre cartas (px)

    // Largura do palco: 3 cartas + 2 gaps
    const STAGE_W = CARD_W * 3 + GAP * 2;
    // Largura da FAIXA: 5 cartas + 4 gaps
    const TRACK_W = CARD_W * 5 + GAP * 4;

    // Ao “estacionar”, queremos ver: [offL, LEFT, CENTER, RIGHT, offR]
    // Para centralizar LEFT/CENTER/RIGHT, precisamos deslocar 1 carta + 1 gap
    const BASELINE = -(CARD_W + GAP);        // px (pos. de repouso)
    const STEP = CARD_W + GAP;               // quanto desliza por clique

    const trackRef = useRef<HTMLDivElement>(null);

    // índices dos 5 itens renderizados (2 antes e 2 depois do central)
    const five = useMemo(() => {
      const n = foodMenu.length;
      const mod = (i: number) => (i + n) % n;
      return [
        mod(centerIndex - 2), // offL
        mod(centerIndex - 1), // left
        mod(centerIndex),     // center
        mod(centerIndex + 1), // right
        mod(centerIndex + 2), // offR
      ];
    }, [centerIndex]);

    // controle de transição: liga/desliga CSS transition do track
    const setTransitionEnabled = (enabled: boolean) => {
      const node = trackRef.current;
      if (!node) return;
      node.style.transition = enabled ? "transform 500ms ease-in-out" : "none";
    };

    const slide = (dir: "next" | "prev") => {
      if (isAnimating) return;
      setAnimating(true);
      // 1) garante que a transição está ativa
      setTransitionEnabled(true);
      // 2) move a faixa: next = -STEP (vai p/ esquerda), prev = +STEP (vai p/ direita)
      const delta = dir === "next" ? -STEP : STEP;
      setOffset(delta);
    };

    const handlePrev = () => slide("prev");
    const handleNext = () => slide("next");

    const onTransitionEnd = () => {
      // 3) ao fim, rotaciona o centro conforme o deslocamento
      if (offset < 0) {
        // andamos uma carta para a esquerda (next)
        setCenterIndex((i) => (i + 1) % foodMenu.length);
      } else if (offset > 0) {
        // andamos uma carta para a direita (prev)
        setCenterIndex((i) => (i - 1 + foodMenu.length) % foodMenu.length);
      }

      // 4) desliga a transição, reseta offset para 0 sem animação (evita “pulo”)
      setTransitionEnabled(false);
      setOffset(0);

      // 5) libera para próxima animação
      requestAnimationFrame(() => {
        setAnimating(false);
        // reabilita transição para a próxima interação
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    };

    return (
      <div className="w-full h-[calc(100vh-60px)] bg-black relative flex items-center justify-center overflow-hidden">
        {/* Botões laterais */}
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400 disabled:opacity-40"
          aria-label="Anterior"
        >
          ❮
        </button>
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400 disabled:opacity-40"
          aria-label="Próximo"
        >
          ❯
        </button>

        {/* PALCO */}
        <div className="overflow-hidden" style={{ width: STAGE_W }}>
          {/* FAIXA (5 cartas lado a lado) */}
          <div
            ref={trackRef}
            className="flex items-stretch"
            style={{
              width: TRACK_W,
              gap: GAP,
              transform: `translateX(${BASELINE + offset}px)`,
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {five.map((idx, i) => {
              const dish = foodMenu[idx];
              const isCenter = i === 2;

              return (
                // SLOT fixo para garantir layout estável
                <div
                  key={`${idx}-${i}`}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: CARD_W, height: CARD_H }}
                >
                  {/* CARTA escalada suavemente dentro do slot */}
                  <div
                    className={`h-full w-full rounded-xl border border-zinc-700 bg-zinc-800 text-white shadow-md overflow-hidden will-change-transform transition-transform duration-500 ease-in-out ${
                      isCenter ? "scale-100 opacity-100" : "scale-80 opacity-70"
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish[language]}
                      className={`w-full h-56 object-cover`}
                    />
                    <div className="p-4 h-[calc(100%-14rem)] overflow-hidden flex flex-col">
                      <h2
                        className={`${isCenter ? "text-2xl" : "text-lg"} font-bold mb-2 ${
                          language === "he" ? "text-right" : "text-left"
                        } transition-all duration-500`}
                      >
                        {dish[language]}
                      </h2>
                      <p
                        className={`${isCenter ? "text-sm" : "text-xs"} text-zinc-300 whitespace-pre-wrap overflow-auto transition-all duration-500`}
                      >
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
