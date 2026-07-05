# Ledgerly Backend

API REST de Ledgerly para gestion financiera multiempresa.

## Requisitos

- Node.js
- MongoDB
- Variables de entorno configuradas en `.env`

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

El servidor corre por defecto en:

```text
http://localhost:4000
```

## Ejecutar en produccion

```bash
npm start
```

## Estructura Principal

```text
backend/
  index.js
  src/
    config/
    controllers/
    helpers/
    middleware/
    models/
    routes/
    utils/
```

## Endpoints Base

```text
/api/auth
/api/users
/api/companies
/api/accounts
/api/periods
/api/transactions
/api/purchases
/api/reports
/api/dashboard
```

## Flujo Multiempresa

1. El administrador registra empresas.
2. El administrador crea usuarios.
3. El administrador enlaza una o mas empresas a cada contador.
4. El contador inicia sesion.
5. Si tiene varias empresas, selecciona la empresa activa.
6. Las consultas trabajan con la empresa activa del token.

## Notas

- Los datos demo y scripts de poblado fueron removidos del proyecto.
- Las cuentas, periodos, empresas y transacciones deben registrarse desde la aplicacion o desde endpoints protegidos.
