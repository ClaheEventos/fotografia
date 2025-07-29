import { useState } from "react";

function SubirArchivos() {
  const [archivos, setArchivos] = useState([]);
  const [fallidos, setFallidos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const folderId = localStorage.getItem("folderId");
  const folderLink = localStorage.getItem("folderLink");
  const evento = localStorage.getItem("evento");
  const fecha = localStorage.getItem("fecha");
  const duenio = localStorage.getItem("duenio");

  const subirArchivos = async (archivosASubir = archivos) => {
    if (!archivosASubir.length || !folderId) {
      alert("⚠️ Seleccioná archivos y asegurate de haber creado una carpeta");
      return;
    }

    setSubiendo(true);
    setFinalizado(false);
    setFallidos([]);
    setProgreso(0);

    const nuevosFallidos = [];

    for (let i = 0; i < archivosASubir.length; i++) {
      const archivo = archivosASubir[i];
      const reader = new FileReader();

      const base64 = await new Promise((resolve) => {
        reader.onload = (e) => {
          resolve(e.target.result.split(",")[1]);
        };
        reader.readAsDataURL(archivo);
      });

      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbx63E5b-tOrD_cXI7o-jHgkLQ9yDWHXam2IA9Jnw-saadbUUhFUzTf2rYOwJ2ZSbL_l3Q/exec",
          {
            method: "POST",
            body: JSON.stringify({
              action: "subirArchivo",
              folderId: folderId,
              file: base64,
              fileName: archivo.name,
              mimeType: archivo.type,
            }),
          }
        );

        const data = await res.json();
        if (!data.fileId) {
          console.error(`❌ Error al subir ${archivo.name}`);
          nuevosFallidos.push(archivo);
        }
      } catch (err) {
        console.error(`❌ Error al subir ${archivo.name}`, err);
        nuevosFallidos.push(archivo);
      }

      const porcentaje = Math.round(((i + 1) / archivosASubir.length) * 100);
      setProgreso(porcentaje);
    }

    setSubiendo(false);
    setFallidos(nuevosFallidos);
    setFinalizado(nuevosFallidos.length === 0);
  };

  const reintentarFallidos = () => {
    subirArchivos(fallidos);
  };

  return (
    <div className="contenedor-crear">
      <h2>Subir Fotos o Videos</h2>

      {!folderId && (
        <p style={{ color: "red" }}>⚠️ Primero tenés que crear una carpeta</p>
      )}

      {!subiendo && !finalizado && (
        <>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => setArchivos(Array.from(e.target.files))}
          />
          {fallidos.length > 0 ? (
            <button onClick={reintentarFallidos}>🔁 Reintentar Fallidos</button>
          ) : (
            <button onClick={() => subirArchivos()}>Subir Archivos</button>
          )}
        </>
      )}

      {subiendo && (
        <>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progreso}%` }}></div>
          </div>
          <p>📤 Subiendo archivos... {progreso}%</p>
        </>
      )}

      {finalizado && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ ¡Gracias por subir tus archivos!
        </p>
      )}

      {fallidos.length > 0 && !subiendo && (
        <>
          <p style={{ color: "red" }}>
            ❌ Algunos archivos no se pudieron subir:
          </p>
          <ul>
            {fallidos.map((archivo, index) => (
              <li key={index}>{archivo.name}</li>
            ))}
          </ul>
        </>
      )}

      {archivos.length > 0 && !finalizado && (
        <ul>
          {archivos.map((archivo, index) => (
            <li key={index}>{archivo.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubirArchivos;