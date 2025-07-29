import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CrearCarpeta() {
  const [evento, setEvento] = useState("1 añito");
  const [nombreEventoPersonalizado, setNombreEventoPersonalizado] = useState("");
  const [fecha, setFecha] = useState("");
  const [duenio, setDuenio] = useState("");
  const [salon, setSalon] = useState("Salón 1"); // valor por defecto
  const [folderId, setFolderId] = useState(null);
  const [creando, setCreando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const navigate = useNavigate();

  const eventos = [
    "1 añito", "15 años", "18 años", "30 Decada", "40 Decada", "50 Decada", "+60 Decada", "Casamiento"
  ];

  const salones = ["Varela", "Varela II", "Berazategui", "Monteverde", "París",
    "Dream's", "Melody", "Luxor", "Bernal", "Sol Fest",
    "Clahe", "Onix", "Auguri", "Dominico II", "Gala", "Sarandí II",
    "Garufa", "Lomas", "Temperley", "Clahe Escalada"]; // opciones de salón

  const crearCarpeta = async () => {
    if ((!evento.trim() && !nombreEventoPersonalizado.trim()) || !fecha || !duenio.trim() || !salon.trim()) {
      alert("⚠️ Completá todos los campos: evento, fecha, dueño y salón");
      return;
    }

    setProgreso(0);
    setCreando(true);

    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 95) {
          clearInterval(intervalo);
          return 95;
        }
        return prev + 5;
      });
    }, 150);

    const nombreFinalEvento = nombreEventoPersonalizado.trim() !== "" ? nombreEventoPersonalizado : evento;
    const nombreCarpeta = `${nombreFinalEvento} -${salon} - ${fecha} - ${duenio}`;

    try {
      // 1. Crear carpeta en Drive
      const resCarpeta = await fetch("https://script.google.com/macros/s/AKfycbx63E5b-tOrD_cXI7o-jHgkLQ9yDWHXam2IA9Jnw-saadbUUhFUzTf2rYOwJ2ZSbL_l3Q/exec", {
        method: "POST",
        body: JSON.stringify({
          action: "crearCarpeta",
          nombre: nombreCarpeta,
          evento: nombreFinalEvento,
          fecha: fecha,
          duenio: duenio
        }),
      });

      const dataCarpeta = await resCarpeta.json();

      if (!dataCarpeta.folderId) throw new Error("No se obtuvo folderId");

      const folderId = dataCarpeta.folderId;
      const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

      // DEBUG: verificar datos enviados
      console.log("✅ Enviando al Apps Script:", {
        eventoBase: evento,
        evento: nombreFinalEvento,
        fecha,
        duenio,
        salon,
        link: folderLink
      });

      // 2. Registrar en hoja de cálculo incluyendo el salón
      await fetch("https://script.google.com/macros/s/AKfycbxMBspcaZ9L424Nk1UZMyk-RPsawSqpM9P05lPikgkAY7LCeiMf7AIduLPIFEF64T5F9A/exec", {
        method: "POST",
        body: JSON.stringify({
          eventoBase: evento,
          evento: nombreFinalEvento,
          fecha: fecha,
          duenio: duenio,
          salon: salon,
          link: folderLink
        }),
      });

      clearInterval(intervalo);
      setProgreso(100);
      setFolderId(folderId);
      localStorage.setItem("folderId", folderId);

      setTimeout(() => {
        navigate("/subir");
      }, 700);
    } catch (error) {
      clearInterval(intervalo);
      setProgreso(0);
      alert("❌ Error al crear carpeta o registrar datos");
      console.error(error);
      setCreando(false);
    }
  };

  return (
    <div className="contenedor-crear">
      <h2>Crear Carpeta</h2>

      <label>Seleccionar Evento</label>
      <select name="evento" value={evento} onChange={(e) => setEvento(e.target.value)}>
        {eventos.map((ev, index) => (
          <option key={index} value={ev}>{ev}</option>
        ))}
      </select>

    
      <br />

      <label>Seleccionar Fecha</label>
      <input
        type="date"
        name="fecha"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <br />

      <label>Nombre del fotógrafo</label>
      <input
        type="text"
        name="duenio"
        placeholder="Ej: Juan Pérez"
        value={duenio}
        onChange={(e) => setDuenio(e.target.value)}
      />

      <br />

      <label>Salón</label>
      <select name="salon" value={salon} onChange={(e) => setSalon(e.target.value)}>
        {salones.map((sal, idx) => (
          <option key={idx} value={sal}>{sal}</option>
        ))}
      </select>

      <br />

      {!creando ? (
        <button onClick={crearCarpeta}>Crear Carpeta</button>
      ) : (
        <>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progreso}%` }}></div>
          </div>
          <p>⏳ Creando carpeta... {progreso}%</p>
        </>
      )}

      {folderId && <p>ID Carpeta: {folderId}</p>}
    </div>
  );
}

export default CrearCarpeta;