import { useState } from "react";
import { foodMenu } from "../data/MenuData";
import type { Dish } from "../data/MenuData";

interface FoodCarouselProps {
  language: "he" | "pt" | "en";
}

export default function FoodCarousel({ language }: FoodCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = foodMenu.length;
  const getIndex = (offset: number) => (currentIndex + offset + total) % total;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Botão à esquerda */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400"
      >
        ❮
      </button>

      {/* Botão à direita */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-30 hover:text-rose-400"
      >
        ❯
      </button>

      <div className="flex items-center justify-center w-full max-w-screen-xl px-2 relative">
        {[getIndex(-1), getIndex(0), getIndex(1)].map((dishIndex, i) => {
          const isCenter = i === 1;
          const dish = foodMenu[dishIndex];

          return (
            <div
              key={dishIndex}
              className={`absolute transition-all duration-500 ease-in-out flex-shrink-0 rounded-xl border border-zinc-700 bg-zinc-800 text-white shadow-md overflow-hidden 
                ${i === 0 ? "left-[5%] scale-90 opacity-40 w-[220px] h-[32rem] z-10" : ""}
                ${isCenter ? "left-1/2 -translate-x-1/2 scale-100 opacity-100 w-[480px] h-[40rem] z-20" : ""}
                ${i === 2 ? "right-[5%] scale-90 opacity-40 w-[220px] h-[32rem] z-10" : ""}`}
            >
              <img
                src={dish.image}
                alt={dish[language]}
                className="w-full h-56 object-cover"
              />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-224px)]">
                <h2 className={`text-lg font-bold mb-2 ${language === "he" ? "text-right" : "text-left"}`}>
                  {dish[language]}
                </h2>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap overflow-auto">
                  {dish.description[language]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
