import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CrearCarpeta() {
  const [evento, setEvento] = useState("Evento 1");
  const [nombreEventoPersonalizado, setNombreEventoPersonalizado] = useState("");
  const [fecha, setFecha] = useState("");
  const [duenio, setDuenio] = useState("");
  const [folderId, setFolderId] = useState(null);
  const [creando, setCreando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const navigate = useNavigate();

  const eventos = [
    "Evento 1", "Evento 2", "Evento 3", "Evento 4", "Evento 5",
    "Evento 6", "Evento 7", "Evento 8", "Evento 9", "Evento 10"
  ];

  const crearCarpeta = async () => {
    if ((!evento && !nombreEventoPersonalizado) || !fecha || !duenio) {
      alert("⚠️ Completá todos los campos: evento, fecha y dueño");
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
    const nombreCarpeta = `${nombreFinalEvento} - ${fecha} - ${duenio}`;

    try {
      // 📁 1. Crear carpeta en Drive
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

      // 🛠️ DEBUG opcional
      console.log("Registrando en hoja:", {
        evento: nombreFinalEvento,
        fecha,
        duenio
        // link: folderLink (eliminado porque da error)
      });

      // 📄 2. Registrar en hoja de cálculo (sin el campo link)
      await fetch("https://script.google.com/macros/s/AKfycbzeAVGEefNfYePAjx6LGw97cL0NzfeWbza1o-jEeps3EGXpqKbucOTTdSdm8PaqLHNqwg/exec", {
        method: "POST",
        body: JSON.stringify({
          evento: nombreFinalEvento,
          fecha: fecha,
          duenio: duenio,
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

      <label>Nombre del Evento (personalizado)</label>
      <input
        type="text"
        name="nombreEventoPersonalizado"
        placeholder="Ej: Casamiento Agustina y Leo"
        value={nombreEventoPersonalizado}
        onChange={(e) => setNombreEventoPersonalizado(e.target.value)}
      />

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