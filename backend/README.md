# Ledgerly Backend - API REST

Backend de Ledgerly Base para gestión financiera de MiPymes.

## 🚀 Inicio Rápido (Para demostrar mañana)

### 1. Instalar MongoDB

**Windows:**
```bash
# Descargar desde: https://www.mongodb.com/try/download/community
# Iniciar el servicio
net start MongoDB
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 2. Instalar Dependencias

```bash
cd backend
npm install
```

### 3. Configurar Variables de Entorno

El archivo `.env` ya está creado con valores por defecto. Verifica que MongoDB esté en el puerto correcto (27017).

### 4. Poblar la Base de Datos con Datos de Prueba

```bash
npm run seed
```

Esto creará:
- ✅ 1 empresa de ejemplo (Café El Buen Sabor)
- ✅ 16 cuentas contables (ingresos, costos, gastos)
- ✅ 2 periodos (Enero y Febrero 2026)
- ✅ 17 transacciones de ejemplo en Febrero 2026

### 5. Iniciar el Servidor

```bash
npm run dev
```

El servidor estará corriendo en: **http://localhost:4000**

## 📊 Probar la API

### Ver todas las transacciones
```bash
curl http://localhost:4000/api/transactions
```

### Ver resumen del periodo
```bash
# Obtener el ID del periodo de febrero desde:
curl http://localhost:4000/api/periods

# Luego usar ese ID:
curl http://localhost:4000/api/transactions/summary/{PERIOD_ID}
```

### Registrar un nuevo gasto
```bash
curl -X POST http://localhost:4000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-07",
    "type": "egreso",
    "accountCode": "6-1-08",
    "description": "Papelería y útiles",
    "amount": 350,
    "periodId": "PERIODO_ID_AQUI",
    "companyId": "COMPANY_ID_AQUI"
  }'
```

## 📁 Estructura del Backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Conexión a MongoDB
│   ├── models/
│   │   ├── Company.js            # Modelo de Empresa
│   │   ├── Account.js            # Modelo de Cuenta
│   │   ├── Period.js             # Modelo de Periodo
│   │   └── Transaction.js        # Modelo de Transacción ⭐
│   ├── controllers/
│   │   ├── transactionController.js  # Lógica de transacciones ⭐
│   │   ├── accountController.js
│   │   └── periodController.js
│   ├── routes/
│   │   ├── transactionRoutes.js  # Rutas de transacciones ⭐
│   │   ├── accountRoutes.js
│   │   └── periodRoutes.js
│   └── scripts/
│       └── seed.js               # Datos de prueba ⭐
├── .env                          # Variables de entorno
├── index.js                      # Punto de entrada
└── package.json
```

## 🛣️ Endpoints Disponibles

### Transacciones (⭐ Principal para demostrar)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar todas las transacciones |
| GET | `/api/transactions/:id` | Obtener una transacción |
| POST | `/api/transactions` | Crear transacción (ingreso/gasto) |
| PUT | `/api/transactions/:id` | Actualizar transacción |
| DELETE | `/api/transactions/:id` | Eliminar transacción |
| GET | `/api/transactions/summary/:periodId` | Resumen del periodo |

### Cuentas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/accounts` | Listar cuentas |
| POST | `/api/accounts` | Crear cuenta |

### Periodos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/periods` | Listar periodos |
| POST | `/api/periods` | Crear periodo |

## 💡 Ejemplos para la Demostración de Mañana

### 1. Mostrar todas las transacciones en Postman/Thunder Client

```
GET http://localhost:4000/api/transactions
```

### 2. Mostrar resumen financiero

Primero obtener el ID del periodo:
```
GET http://localhost:4000/api/periods
```

Luego el resumen:
```
GET http://localhost:4000/api/transactions/summary/{periodId}
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "totalIngresos": 18300,
    "totalEgresos": 28400,
    "resultado": -10100,
    "cantidadIngresos": 6,
    "cantidadEgresos": 11,
    "totalTransacciones": 17
  }
}
```

### 3. Registrar un nuevo gasto en vivo

```json
POST http://localhost:4000/api/transactions
Content-Type: application/json

{
  "date": "2026-02-07",
  "type": "egreso",
  "accountCode": "6-1-08",
  "description": "Compra de papel y útiles de oficina",
  "amount": 450,
  "periodId": "USAR_ID_DEL_PERIODO_FEBRERO",
  "companyId": "USAR_ID_DE_LA_EMPRESA"
}
```

### 4. Mostrar que se guardó en MongoDB

Puedes usar MongoDB Compass para mostrar visualmente:
- Database: `ledgerly`
- Collection: `transactions`
- Ver el nuevo documento recién creado

## 🗄️ Datos de Prueba Incluidos

Al ejecutar `npm run seed` se crean:

**Empresa:**
- Café El Buen Sabor (HNL, año fiscal 2026)

**Cuentas (16 en total):**
- 4 cuentas de Ingresos
- 4 cuentas de Costos Directos
- 8 cuentas de Gastos Operativos

**Transacciones en Febrero 2026:**
- 6 ingresos (ventas de café, comidas, postres)
- 11 egresos (costos directos + gastos operativos)
- Total Ingresos: L. 18,300
- Total Egresos: L. 28,400

## 🔧 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Poblar base de datos
npm run seed
```

## 🐛 Troubleshooting

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
# Windows
net start MongoDB

# Mac/Linux
brew services list
sudo systemctl status mongodb
```

### Puerto 4000 ocupado
Cambiar en `.env`:
```
PORT=4001
```

### Error "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Validaciones Implementadas

- ✅ No se puede registrar en periodo cerrado
- ✅ La cuenta debe existir
- ✅ El tipo de transacción debe coincidir con el grupo de cuenta
- ✅ El monto debe ser positivo
- ✅ La fecha es requerida

## 🎯 Para la Demostración de Mañana

1. **Mostrar MongoDB conectado** (logs en consola)
2. **Listar transacciones existentes** (GET /api/transactions)
3. **Mostrar resumen financiero** (GET /api/transactions/summary/:periodId)
4. **Registrar un gasto en vivo** (POST /api/transactions)
5. **Verificar que se guardó** (GET nuevamente o MongoDB Compass)
6. **Explicar la estructura** (modelos, controladores, rutas)

## 🚀 Próximos Pasos (Sprint 1)

- [ ] Implementar autenticación JWT
- [ ] Agregar usuarios y roles
- [ ] Validaciones más robustas
- [ ] Tests unitarios
- [ ] Documentación Swagger

---

**Estado:** ✅ Funcional para demostración  
**Última actualización:** 07/02/2026
