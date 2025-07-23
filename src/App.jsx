import { BrowserRouter, Routes, Route } from "react-router-dom";
import CrearCarpeta from "./pages/CrearCarpeta.jsx";
import SubirArchivos from "./pages/SubirArchivos.jsx";
import logo from "./assets/image/logo.png";

function App() {
  return (
    <BrowserRouter basename="/fotografia">
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <img src={logo} alt="Logo" style={{ width: '200px', height: 'auto' }} />
      </div>

      <Routes>
        <Route path="/" element={<CrearCarpeta />} />
        <Route path="/subir" element={<SubirArchivos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;