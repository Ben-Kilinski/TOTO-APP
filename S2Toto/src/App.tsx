function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-rose-600 mb-4">
        🍽️ Toto Menu
      </h1>
      <p className="text-lg text-gray-700 text-center max-w-md">
        Bem-vindo ao cardápio trilingue do restaurante <strong>Toto</strong>. Estude os pratos e traduções para sua prova de garçom!
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition">
          Ver Cardápio
        </button>
        <button className="border border-rose-600 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 transition">
          Sobre o Restaurante
        </button>
      </div>
    </div>
  )
}
export default App
