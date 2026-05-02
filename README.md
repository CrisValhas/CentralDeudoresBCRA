# Central de Deudores - Vite + React

Aplicación React para consultar la API pública de Central de Deudores del BCRA.

## Inicio rápido

```bash
npm install
npm run dev
```

La app expone un campo para `Identificación` y un selector `Histórico`.
En desarrollo, Vite usa el proxy `/bcra-api` hacia:

```text
https://api.bcra.gob.ar/CentralDeDeudores/v1.0
```

Para apuntar a otra base de API, definí `VITE_BCRA_API_BASE`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
