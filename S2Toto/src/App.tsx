import { useState } from "react";
import Navbar from "./components/Navbar";
import FoodCarousel from "./components/FoodCarousel";

function App() {
  const [language, setLanguage] = useState<"he" | "pt" | "en">("he");

  const NAVBAR_H = 60; // altura da navbar

  return (
    <div className="bg-black h-screen text-white flex flex-col overflow-hidden">
      {/* Navbar fixa no topo */}
      <div style={{ height: NAVBAR_H }}>
        <Navbar language={language} setLanguage={setLanguage} />
      </div>

      {/* Main ocupa o resto da tela */}
      <main
        className="flex-1 overflow-hidden"
        style={{ height: `calc(100vh - ${NAVBAR_H}px)` }}
      >
        <FoodCarousel language={language} />
      </main>
    </div>
  );
}

export default App;
