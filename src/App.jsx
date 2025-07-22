import { BrowserRouter, Routes, Route } from "react-router-dom";
import CrearCarpeta from "./pages/CrearCarpeta.jsx";
import SubirArchivos from "./pages/SubirArchivos.jsx";

function App() {
  return (
    <BrowserRouter basename="/fotografia">
      <Routes>
        <Route path="/" element={<CrearCarpeta />} />
        <Route path="/subir" element={<SubirArchivos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;