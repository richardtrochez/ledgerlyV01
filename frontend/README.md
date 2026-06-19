# 🚀 Ledgerly Base - Frontend

Sistema de gestión financiera para MiPymes desarrollado con **Vue 3 + Tailwind CSS**.

## 📋 Tabla de Contenido

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Plan de Trabajo Sprint 2](#plan-de-trabajo-sprint-2)
- [Próximos Pasos](#próximos-pasos)

---

## 📝 Descripción

Ledgerly Base es una aplicación web para contadores y MiPymes de servicios que no gestionan inventarios. Su objetivo es sustituir Excel como herramienta principal de cierre mensual, centralizando el registro de ingresos y gastos, generando automáticamente el Estado de Resultados y KPIs clave.

**Sprint 2**: Este proyecto cubre la implementación del módulo de **Transacciones y Periodos** en el frontend.

---

## ✨ Características

### ✅ Implementadas (Sprint 2)

- ✅ **Registro de Transacciones**: Formulario dual para ingresos y egresos
- ✅ **Listado con Filtros**: Tabla responsiva con filtros por periodo y tipo
- ✅ **Gestión de Periodos**: Selector y creación de periodos contables
- ✅ **Dashboard de Resumen**: Cards con totales de ingresos, egresos y resultado
- ✅ **Validaciones**: Validación en tiempo real de formularios
- ✅ **UI/UX**: Diseño minimalista con paleta azul de confianza
- ✅ **Responsivo**: Diseño mobile-first

### 🔜 Próximas Funciones (Sprint 3-5)

- ⏳ Estado de Resultados comparativo por meses
- ⏳ Dashboard de KPIs avanzados (márgenes, top gastos, alertas)
- ⏳ Exportación a PDF y Excel
- ⏳ Importación desde CSV/Excel con mapeo de columnas

---

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vue 3** | ^3.4.19 | Framework JavaScript reactivo |
| **Vite** | ^5.1.3 | Build tool y dev server |
| **Tailwind CSS** | ^3.4.1 | Framework CSS utility-first |
| **Pinia** | ^2.1.7 | State management |
| **Vue Router** | ^4.2.5 | Enrutamiento SPA |
| **Axios** | ^1.6.7 | Cliente HTTP |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.x ([Descargar aquí](https://nodejs.org/))
- **npm** >= 9.x (incluido con Node.js)
- **Backend de Ledgerly** corriendo en `http://localhost:4000` ([Ver backend](../backend))

---

## 🚀 Instalación

### Paso 1: Clonar o descargar el proyecto

```bash
# Si tienes el proyecto en un repositorio
git clone [url-del-repositorio]
cd frontend

# O simplemente descomprime el archivo ZIP en una carpeta
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias definidas en `package.json`:
- Vue 3 y su ecosistema
- Tailwind CSS y plugins
- Axios para peticiones HTTP
- Y otras dependencias necesarias

---

## ⚙️ Configuración

### Paso 1: Crear archivo de variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Paso 2: Configurar variables (archivo `.env`)

```env
# URL del backend (asegúrate que coincida con tu backend)
VITE_API_URL=http://localhost:4000/api

# Ambiente
VITE_APP_ENV=development

# ID de empresa temporal (hasta implementar autenticación)
VITE_COMPANY_ID=000000000000000000000001
```

### Paso 3: Verificar que el backend está corriendo

Antes de iniciar el frontend, asegúrate de que tu backend esté corriendo:

```bash
# En otra terminal, navega a la carpeta del backend
cd ../backend

# Inicia el servidor
npm start

# Deberías ver: "Servidor ON 4000"
```

---

## 🏃‍♂️ Ejecución

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en:
- **URL**: `http://localhost:5173`
- **Hot Reload**: Los cambios se reflejan automáticamente
- **Puerto**: 5173 (default de Vite)

### Build para Producción

```bash
npm run build
```

Esto generará los archivos optimizados en la carpeta `dist/`.

### Preview del Build

```bash
npm run preview
```

Vista previa del build de producción en `http://localhost:4173`.

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/                      # Archivos estáticos
├── src/
│   ├── api/                     # Servicios de API
│   │   ├── axios.js            # Configuración de Axios
│   │   ├── transactions.js     # API de transacciones
│   │   ├── periods.js          # API de periodos
│   │   └── accounts.js         # API de cuentas
│   ├── assets/
│   │   └── main.css            # CSS principal + Tailwind
│   ├── components/
│   │   ├── common/             # Componentes reutilizables
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseModal.vue
│   │   │   └── LoadingSpinner.vue
│   │   ├── dashboard/
│   │   │   └── SummaryCards.vue
│   │   ├── periods/
│   │   │   └── PeriodSelector.vue
│   │   └── transactions/
│   │       ├── TransactionForm.vue
│   │       └── TransactionList.vue
│   ├── router/
│   │   └── index.js            # Configuración de rutas
│   ├── stores/                  # Pinia stores
│   │   ├── transactions.js
│   │   ├── periods.js
│   │   └── accounts.js
│   ├── views/                   # Vistas principales
│   │   ├── Dashboard.vue
│   │   └── Transactions.vue
│   ├── App.vue                  # Componente raíz
│   └── main.js                  # Entry point
├── .env.example                 # Variables de entorno ejemplo
├── index.html                   # HTML principal
├── package.json                 # Dependencias y scripts
├── postcss.config.js            # Configuración PostCSS
├── tailwind.config.js           # Configuración Tailwind
└── vite.config.js               # Configuración Vite
```

---

## 🧩 Componentes Principales

### 1. **TransactionForm.vue**
Formulario dual para crear/editar ingresos y egresos.

**Características**:
- Tabs para seleccionar tipo (Ingreso/Egreso)
- Selector de cuenta filtrado por tipo
- Validaciones en tiempo real
- Preview del monto formateado en HNL

**Props**:
```javascript
{
  transaction: Object,  // Para modo edición
  loading: Boolean,
  onCancel: Function
}
```

**Eventos**:
```javascript
@submit  // Emite el payload de la transacción
```

### 2. **TransactionList.vue**
Tabla de transacciones con filtros y acciones.

**Características**:
- Filtros por periodo y tipo
- Acciones: Editar, Eliminar (con confirmación)
- Badges de tipo (verde/rojo)
- Modal de confirmación de eliminación

**Props**:
```javascript
{
  transactions: Array,
  loading: Boolean
}
```

**Eventos**:
```javascript
@edit    // Emite la transacción a editar
@delete  // Emite el ID de la transacción
@filter  // Emite los filtros aplicados
```

### 3. **PeriodSelector.vue**
Selector de periodo activo y creación de nuevos.

**Características**:
- Dropdown con periodos existentes
- Badge de estado (Abierto/Cerrado)
- Modal para crear nuevo periodo
- Validación de periodos duplicados

**Eventos**:
```javascript
@period-changed  // Emite el periodo seleccionado
```

### 4. **SummaryCards.vue**
Dashboard con resumen financiero del periodo.

**Características**:
- 3 cards: Ingresos, Egresos, Resultado
- Progress bars de porcentajes
- Iconos semánticos
- Estados visuales (superávit/déficit)

**Props**:
```javascript
{
  summary: {
    totalIngresos: Number,
    totalEgresos: Number,
    resultado: Number,
    cantidadIngresos: Number,
    cantidadEgresos: Number,
    totalTransacciones: Number
  }
}
```

---

## 🎨 Paleta de Colores

La aplicación usa una paleta de **azules de confianza**:

```javascript
primary: {
  50: '#eff6ff',   // Backgrounds claros
  100: '#dbeafe',  // Hover states
  500: '#3b82f6',  // Color principal (botones)
  600: '#2563eb',  // Hover en botones
  900: '#1e3a8a',  // Textos oscuros
}

success: '#10b981',  // Verde (ingresos)
danger: '#ef4444',   // Rojo (egresos)
warning: '#f59e0b',  // Amarillo (alertas)
```

---

## 📅 Plan de Trabajo Sprint 2

### ✅ Completado

- [x] Setup del proyecto (Vite + Vue 3 + Tailwind)
- [x] Configuración de Axios y servicios API
- [x] Stores de Pinia (transactions, periods, accounts)
- [x] Componentes base (Button, Card, Modal, Spinner)
- [x] Formulario de transacciones dual
- [x] Lista de transacciones con filtros
- [x] Selector de periodos
- [x] Dashboard de resumen
- [x] Responsive design
- [x] Validaciones de formularios

### 🔧 Mejoras Opcionales

- [ ] Animaciones de transición mejoradas
- [ ] Skeleton loaders para estados de carga
- [ ] Gráficos de tendencias (Chart.js)
- [ ] Paginación en tabla de transacciones
- [ ] Búsqueda por texto en transacciones

---

## 🚦 Próximos Pasos (Sprint 3-5)

### Sprint 3: Estado de Resultados
- Generar EERR comparativo por meses
- Vista de EERR con grupos de cuentas
- Exportación a Excel básica

### Sprint 4: KPIs y Dashboard Avanzado
- Dashboard con KPIs del proyecto (márgenes, top gastos, etc.)
- Alertas configurables
- Gráficos de tendencias
- Exportación a PDF

### Sprint 5: Importación y Refinamiento
- Importación desde CSV/Excel con mapeo
- Validaciones avanzadas
- Mejoras UX
- Testing y documentación

---

## 🐛 Solución de Problemas

### El frontend no se conecta al backend

1. Verifica que el backend esté corriendo:
```bash
curl http://localhost:4000/api
```

2. Revisa las variables de entorno en `.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

3. Verifica CORS en el backend (`backend/index.js`):
```javascript
cors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

### Error de módulos no encontrados

```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Tailwind no aplica estilos

1. Verifica que `main.css` esté importado en `main.js`
2. Revisa `tailwind.config.js` - debe incluir los paths correctos:
```javascript
content: [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}",
],
```

---

## 📞 Soporte

Para problemas técnicos o preguntas:
- Revisa los logs de la consola del navegador (F12)
- Verifica los logs del backend en la terminal
- Consulta la documentación de Vue 3: https://vuejs.org/
- Consulta la documentación de Tailwind: https://tailwindcss.com/

---

## 📄 Licencia

Este proyecto es parte del trabajo de titulación universitario.

---

## 👨‍💻 Autor

**[Tu Nombre]** - [Tu Código]  
Fecha: 07/02/2026

---

**¡Feliz desarrollo! 🚀**
