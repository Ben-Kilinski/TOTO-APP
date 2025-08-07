import logo from "../../public/LOGOOO.png";

interface NavbarProps {
  language: "he" | "pt" | "en";
  setLanguage: (lang: "he" | "pt" | "en") => void;
}

export default function Navbar({ language, setLanguage }: NavbarProps) {
  return (
    <nav className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-18 h-10" />
        {/* <span className="text-xl font-bold">Toto Menu</span> */}
      </div>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "he" | "pt" | "en")}
        className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded"
      >
        <option value="he">Hebrew</option>
        <option value="pt">Portuguese</option>
        <option value="en">English</option>
      </select>
    </nav>
  );
}
