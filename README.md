# 🥑 Keto Premium Delivery System

Plataforma web de entrega a domicilio para alimentación cetogénica boutique y de alta gama. Desarrollada con **Next.js (App Router)**, **React 19**, **Tailwind CSS v4** y **Supabase**, bajo la filosofía visual y de experiencia de usuario del sistema de diseño **"Emerald & Ether"** (*Boutique Minimalism*).

---

## 🌟 Características Principales

### 🍽️ Experiencia del Cliente (Storefront)
- **Catálogo Gourmet Keto:** Menú curado con cálculo exacto de macronutrientes (calorías y proteína) por porción.
- **Filtros Dinámicos:** Navegación por categorías (*Todos*, *Alto Proteína*, *Premium*).
- **Detalle de Producto Interactivo:** Modales con información nutricional, disclaimer metabólico y galería de fotos del empaque de entrega.
- **Soporte Bilingüe (i18n):** Selector instantáneo de idioma Español / English sin recarga de página.
- **Control de Horario de Atención:** Notificación visual y bloqueo amigable de compras si la cocina se encuentra en horario de descanso (*Cerrado / Abierto*).

### 🛒 Carrito de Compras y Checkout Inteligente
- **Cálculo Transparente:** Desglose automático de subtotal, costo de envío urbano y total.
- **Integración Directa con WhatsApp:** Generación automática del mensaje estructurado con el pedido detallado, dirección de entrega e instrucciones de transferencia vía **Nequi**.
- **Seguimiento de Conversión:** Registro de derivaciones hacia WhatsApp para analítica comercial.

### 🔐 Panel de Administración (`/admin` & `/admin/dashboard`)
- **Acceso Rápido por PIN:** Teclado numérico táctil protegido por código de seguridad.
- **Interruptor de Estado en Tiempo Real:** Abrir o cerrar la tienda con un solo clic.
- **Gestión y Visualización de Pedidos:** Listado de órdenes activas, clientes frecuentes e historial.
- **Módulo de Cuadre de Caja & Contabilidad:** Registro de caja inicial, egresos/gastos e ingresos manuales para cierre de turno diario.
- **Soporte Híbrido (Supabase + LocalStorage):** Funciona al 100% en modo demostración/desconectado con persistencia local o sincronizado con base de datos Supabase en producción.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server & Client Components) |
| **Librería UI** | [React 19](https://react.dev/) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables de diseño |
| **Tipografía** | `Manrope` (Titulares) & `Inter` (Cuerpo / Datos técnicos) |
| **Backend & DB** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`) |
| **Iconografía** | SVG modernos & Lucide/Custom Icons |

---

## 📂 Estructura del Proyecto

```plaintext
keto-premium/
├── public/                     # Recursos estáticos (imágenes de bowls, favicon, logos)
│   └── dishes/                 # Fotografías de los platos gourmet
├── src/
│   ├── app/
│   │   ├── (customer)/         # Rutas de la tienda para clientes
│   │   │   ├── cart/           # Página del carrito y checkout
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Página principal (Menú, Hero, Modales)
│   │   ├── admin/              # Portal de administración
│   │   │   ├── dashboard/      # Panel de métricas, pedidos y contabilidad
│   │   │   └── page.tsx        # Login con teclado PIN
│   │   ├── globals.css         # Tokens de diseño, gradientes y utilidades
│   │   └── layout.tsx          # Layout raíz con fuentes Manrope e Inter
│   ├── components/             # Componentes modulares (Header, etc.)
│   ├── lib/
│   │   └── supabase.ts         # Cliente e inicializador de Supabase
│   ├── types/
│   │   └── index.ts            # Definición de tipos (Product, etc.)
│   ├── locales.ts              # Diccionarios de traducción ES / EN
│   └── products.ts             # Catálogo de productos, credenciales y configuración
├── DESIGN.md                   # Especificación completa del sistema de diseño
├── .env.local.example          # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

---

## 🚀 Inicio Rápido

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd keto-premium

# Instalar dependencias con npm (o pnpm / bun / yarn)
npm install
```

### 2. Configurar Variables de Entorno (Opcional)

Copia el archivo de ejemplo para configurar la conexión con Supabase si deseas persistencia remota:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
```
> **Nota:** Si no configuras las variables de Supabase, la aplicación continuará funcionando fluidamente utilizando almacenamiento local en el navegador (`localStorage`).

### 3. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 4. Compilar para Producción

```bash
npm run build
npm run start
```

---

## 🔑 Credenciales y Configuración de Negocio

La configuración principal del negocio y accesos se encuentra centralizada en [`src/products.ts`](file:///c:/dev/keto-premium/src/products.ts):

- **Número de WhatsApp de Pedidos:** `WHATSAPP_NUMBER` (código de país + número, ej: `573133417707`).
- **PIN de Acceso al Panel de Administración:** `ADMIN_PIN` (por defecto: `000178`).

---

## 🎨 Sistema de Diseño: *Emerald & Ether*

El proyecto implementa un sistema visual sobrio y elegante adaptado al perfil del consumidor keto de alta gama. Puedes consultar la especificación detallada en [DESIGN.md](file:///c:/dev/keto-premium/DESIGN.md).

- **Emerald Primary:** `#059669`
- **Jade Secondary:** `#047857`
- **Superficies Claras:** `#f8f9fa` / `#ffffff`
- **Contenedores y Bordes:** Radios hiper-redondeados (`rounded-2xl`, `rounded-3xl`), sombras difusas y desenfoques (*glassmorphism*).

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para **Keto Premium**. Todos los derechos reservados.
