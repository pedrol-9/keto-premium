# Keto Premium Delivery System - Sistema de Diseño "Emerald & Ether"

Este documento contiene la especificación del sistema de diseño para **Keto Premium Delivery System**, extraído directamente de la plataforma Stitch. El diseño está construido bajo la filosofía de **Boutique Minimalism**, enfocado en transmitir lujo, salud, frescura y legibilidad excepcional.

---

## 📑 Índice
1. [Principios de Marca y Estilo](#-principios-de-marca-y-estilo)
2. [Paleta de Colores](#-paleta-de-colores)
3. [Tipografía](#-tipografía)
4. [Espaciado y Distribución](#-espaciado-y-distribución)
5. [Elevación y Profundidad](#-elevación-y-profundidad)
6. [Formas y Bordes (Bordes Redondeados)](#-formas-y-bordes-bordes-redondeados)
7. [Especificación de Componentes](#-especificación-de-componentes)

---

## 🌿 Principios de Marca y Estilo

El sistema de diseño **"Emerald & Ether"** se dirige a un perfil de usuario premium que valora la salud, la transparencia y la sofisticación.
- **Composición Respirable (Breathable Composition):** El espacio en blanco (whitespace) no es un vacío, sino un elemento funcional. Se evita saturar la interfaz.
- **Precisión Orgánica (Organic Precision):** Fusión de grillas tipográficas limpias y precisas con formas de contenedor suaves e hiperredondeadas.
- **Restricción Cromática (Chroma Restraint):** El uso del color es funcional (interacciones y llamadas a la acción) y de marca, evitando la decoración innecesaria.

---

## 🎨 Paleta de Colores

El concepto cromático se basa en **"Paper & Emerald"** (Papel y Esmeralda). Se utiliza un enfoque jerárquico de blancos puros y grises ultra-claros para generar profundidad sin sobrecargar con bordes pesados.

### 🟢 Colores de Marca (Brand Colors)
| Color | Hex | Uso y Descripción |
| :--- | :--- | :--- |
| **Primary (Emerald)** | `#059669` / `#006948` | Elementos interactivos principales. Referencia de frescura y vitalidad. |
| **Secondary (Jade)** | `#047857` / `#006c4e` | Estados de hover e indicadores activos (cambio tonal sutil). |
| **Tertiary** | `#111827` / `#555c6e` | Usado para jerarquizar información secundaria/adicional. |

### ⚪ Fondos y Superficies (Neutrals & Surfaces)
| Nombre del Token | Valor Hex | Descripción |
| :--- | :--- | :--- |
| `background` | `#f8f9fa` | Lienzo base de la aplicación. |
| `surface` | `#f8f9fa` | Superficie estándar. |
| `surface-dim` | `#d9dadb` | Variación de superficie con menor luminosidad. |
| `surface-bright` | `#f8f9fa` | Superficie de alto brillo. |
| `surface-container-lowest` | `#ffffff` | Fondo para los contenedores de menor elevación (Base). |
| `surface-container-low` | `#f3f4f5` | Superficie rebajada suavemente. |
| `surface-container` | `#edeeef` | Contenedores intermedios. |
| `surface-container-high` | `#e7e8e9` | Contenedores elevados. |
| `surface-container-highest`| `#e1e3e4` | Contenedores con máxima elevación de contraste. |

### 🖋️ Textos y Delineados (Ink & Outlines)
| Nombre del Token | Valor Hex | Descripción |
| :--- | :--- | :--- |
| `on-background` | `#191c1d` | Color de texto base sobre el fondo principal. |
| `on-surface` | `#191c1d` | Texto principal sobre contenedores. |
| `on-surface-variant` | `#3d4a42` | Texto secundario o de menor importancia. |
| `outline` | `#6d7a72` | Bordes y divisiones estándar. |
| `outline-variant` | `#bccac0` | Bordes secundarios más suaves. |

### ⚠️ Estados y Errores (Status & Errors)
| Nombre del Token | Valor Hex | Descripción |
| :--- | :--- | :--- |
| `error` | `#ba1a1a` | Color para indicar error. |
| `on-error` | `#ffffff` | Texto/Icono sobre el color de error. |
| `error-container` | `#ffdad6` | Contenedor de advertencia/error. |
| `on-error-container` | `#93000a` | Texto dentro del contenedor de error. |

---

## 🖋️ Tipografía (Typography)

Este sistema combina la neutralidad estructural de **Inter** para el texto de lectura con el carácter contemporáneo de **Manrope** para los títulos importantes.

- **Títulos (Headlines):** **Manrope** (Aporta una personalidad de "boutique", geométrica y cálida).
- **Cuerpo y Etiquetas (Body & Labels):** **Inter** (Máxima legibilidad para tablas nutricionales, ingredientes e información funcional).

### Escala Tipográfica (Typography Scale)

| Estilo | Fuente | Tamaño | Peso | Interlineado (Line Height) | Espaciado de Letra (Letter Spacing) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **display-lg** (Desktop) | `Manrope` | `48px` | `700` (Bold) | `56px` | `-0.02em` |
| **display-lg-mobile** | `Manrope` | `32px` | `700` (Bold) | `40px` | `-0.02em` |
| **headline-md** | `Manrope` | `30px` | `600` (Semibold)| `38px` | `-0.01em` |
| **headline-sm** | `Manrope` | `24px` | `600` (Semibold)| `32px` | `Normal` |
| **body-lg** | `Inter` | `18px` | `400` (Regular) | `28px` | `Normal` |
| **body-md** | `Inter` | `16px` | `400` (Regular) | `24px` | `Normal` |
| **label-md** | `Inter` | `14px` | `600` (Semibold)| `20px` | `0.02em` |
| **label-sm** | `Inter` | `12px` | `500` (Medium)  | `16px` | `0.04em` |

---

## 📐 Espaciado y Distribución (Layout & Spacing)

El ritmo espacial y la distribución se rigen por un modelo híbrido de rejilla fluida con límites fijos.

- **El Ritmo de 8px (The 8px Rhythm):** Todas las dimensiones de espaciado deben ser múltiplos de 8px.
- **Contenedor Máximo (Max Width):** En escritorio, el contenido principal se limita a un ancho máximo de `1280px` para prevenir la fatiga visual.
- **Grilla:** 12 columnas en escritorio, 6 en tablet y 2 en móvil.
- **Márgenes de Pantalla:**
  - Escritorio: `64px` (margen lateral).
  - Móvil: `20px` (margen lateral).
- **Tokens de Espaciado Vertical (Stacking):**
  - `stack-sm`: `16px` (Separación corta entre elementos de un mismo grupo).
  - `stack-md`: `32px` (Separación estándar entre grupos relacionados).
  - `stack-lg`: `64px` (Separación entre secciones principales de la interfaz).

---

## 👥 Elevación y Profundidad

La profundidad se comunica a través de **Sombras Ambientales Suaves** (Soft Ambient Shadows) en lugar de bordes densos.

- **Nivel 0 (Base):** `#F9FAFB` (Fondo general de la aplicación).
- **Nivel 1 (Tarjetas/Contenedores flotantes):** `#FFFFFF` con una sombra difusa muy sutil: `0px 4px 20px rgba(0, 0, 0, 0.03)`.
- **Nivel 2 (Overlays/Modales):** `#FFFFFF` con una sombra más definida pero ligera: `0px 10px 40px rgba(0, 0, 0, 0.06)`.
- **Interactions:** Al pasar el cursor (hover) por tarjetas de producto, se aplica una elevación táctil (moviendo `-2px` en el eje Y).

---

## 🟢 Formas y Bordes (Bordes Redondeados)

Las curvas en el sistema de diseño suavizan la sensación puramente tecnológica de las tipografías sans-serif y se alinean con la naturaleza orgánica de la comida saludable.

- **Tarjetas de Producto (Product Cards):** `rounded-xl` (`1.5rem` / `24px`) para enmarcar la fotografía gastronómica con un borde suave.
- **Botones (Buttons):** `rounded-lg` (`1rem` / `16px`) para un punto de interacción moderno y accesible.
- **Campos de Entrada (Inputs):** Siguen la misma curvatura de los botones (`16px`).
- **Elementos Pequeños (Tags/Chips):** Redondeado completo (`pill` / `9999px`) para distinguirlos visualmente de los botones interactivos.
- **Escala de Redondeado:**
  - `sm`: `0.25rem` (4px)
  - `DEFAULT`: `0.5rem` (8px)
  - `md`: `0.75rem` (12px)
  - `lg`: `1rem` (16px)
  - `xl`: `1.5rem` (24px)
  - `full`: `9999px`

---

## 🧱 Especificación de Componentes

### 1. Botones (Buttons)
- **Primary:** Fondo Esmeralda (`#059669`), texto blanco, esquinas redondeadas de `16px` (`rounded-lg`). Sin bordes.
- **Secondary:** Fondo blanco, borde de `1px` en `#E5E7EB`, texto en gris oscuro.
- **Ghost:** Fondo transparente, texto en gris oscuro, utilizado para acciones secundarias o de baja prioridad.

### 2. Tarjetas de Producto e Ingredientes (Cards)
- Fondo blanco puro (`#FFFFFF`) sobre superficies grises claras (`#F8F9FA`).
- Las imágenes del platillo deben mantener una relación de aspecto de `1:1` o `4:5` con un radio de esquina de `24px`.
- Relleno (padding) interno generoso de `24px` a `32px`.

### 3. Campos de Entrada (Inputs)
- Estado por defecto: Fondo gris claro (`#F3F4F6`), sin bordes.
- Estado enfocado (Focus): Transición suave a fondo blanco, borde de `1px` color Esmeralda (`#059669`) y un resplandor difuminado suave alrededor.

### 4. Chips de Información Nutricional (Nutrition Chips)
- Pequeñas etiquetas con forma de píldora (`pill` / `rounded-full`) para categorizar "Keto", "High Protein", "Gluten-Free".
- Fondo en tono esmeralda ultra-claro (`#ECFDF5`) y texto en color verde esmeralda para máxima legibilidad sin competir con los botones de acción primarios.

### 5. Barra de Navegación (Navigation Header)
- Cabecera fija (sticky top bar) con alta transparencia y efecto de desenfoque de fondo pesado (Glassmorphism) para mantener la noción de profundidad a medida que el usuario navega por las imágenes del catálogo.
