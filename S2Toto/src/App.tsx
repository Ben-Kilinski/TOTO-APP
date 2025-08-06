import { useState } from "react";
import Navbar from "./components/Navbar";
import FoodCarousel from "./components/FoodCarousel";

function App() {
  const [language, setLanguage] = useState<"he" | "pt" | "en">("he");

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar language={language} setLanguage={setLanguage} />
      <main className="mt-0">
        <FoodCarousel language={language} />
      </main>
    </div>
  );
}

export default App;
