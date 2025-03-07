# Campo Eléctrico de una Barra Cargada

## Electricidad y Magnetismo

Este proyecto es una simulación interactiva que ilustra el campo eléctrico generado por una barra cargada, utilizando la librería [p5.js](https://p5js.org/). Además, incluye una carga de prueba (punto P) que se puede mover con el mouse para observar en tiempo real cómo varían las líneas de campo y el vector resultante.

## Características

- **Simulación interactiva:** Arrastra la carga de prueba para ver la variación del campo eléctrico.
- **Visualización dinámica:** Las líneas de campo se trazan suavemente y el vector en la carga de prueba cambia de longitud según la magnitud del campo.
- **Barra estética:** La barra se representa como un rectángulo con pequeños símbolos de “+” para indicar la carga positiva.
- **Código modular:** Proyecto organizado en tres archivos principales:
  - `index.html`
  - `style.css`
  - `script.js`

## Uso

1. Clona o descarga el repositorio.
2. Abre el archivo `index.html` en un navegador web.
3. Interactúa con la simulación arrastrando la carga de prueba.

## Estructura del Proyecto

- **index.html:** Define la estructura básica de la página e incluye la librería p5.js.
- **style.css:** Contiene los estilos para una visualización limpia y sin scroll.
- **script.js:** Implementa la lógica de la simulación, incluyendo:
  - La creación de la barra de cargas.
  - El trazado dinámico de las líneas de campo.
  - La interacción con el mouse para mover la carga de prueba.
  - La visualización de un vector de campo cuya longitud depende de la magnitud del campo.

## Posibles Mejoras

- Añadir controles para modificar parámetros de la simulación en tiempo real.
- Optimizar el trazado de las líneas de campo para mejorar el rendimiento.
- Incluir configuraciones adicionales (por ejemplo, barras con cargas negativas).
