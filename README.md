# Karen Nicol — Join Me in Death

Una experiencia web romántica de estética gótica y vampírica, hecha con HTML, CSS y JavaScript. No necesita instalar dependencias.

## Cómo abrirla
1. Descomprime `karen_nicol_web.zip`.
2. Para ver la web, abre `index.html` con Chrome o Edge.
3. Para que el navegador pueda cargar correctamente JSON local en todos los casos, puedes ejecutarla con un servidor local:
   - Instala Node.js si aún no lo tienes.
   - Abre una terminal dentro de esta carpeta.
   - Ejecuta `npx serve .`
   - Abre la dirección local que indique la terminal.

## Añadir la canción
Coloca un archivo MP3 válido que tengas derecho a utilizar en:
`audio/join-me-in-death.mp3`

Después, recarga la web y pulsa el botón de reproducir. Cambiar la extensión de otro formato a `.mp3` no lo convierte; el audio debe estar codificado como MP3. Por las restricciones del navegador, el audio comienza solo después de una interacción.

## Frases sincronizadas
La web incluye frases originales de demostración con tiempos de ejemplo, para probar la experiencia junto con la canción. No son la letra de HIM y no están sincronizadas con la grabación real. Las frases de demostración están definidas en `script.js`.

## Personalización
- Textos de las escenas: `index.html`
- Estilos y animaciones: `styles.css`
- Reproductor, sincronización y partículas: `script.js`

La tipografía se carga desde Google Fonts cuando hay conexión. Si no hay conexión, se usan fuentes de reserva del sistema.
