# Plan de implementación completa

## Objetivo
Construir una plataforma para recolectar, normalizar, deduplicar y monitorear propiedades publicadas en:
- InfoCasas
- Gallito
- Casasweb
- REMAX Uruguay
- Casas y Más
- Mercado Libre Inmuebles Uruguay

## Fase 0 — Base técnica
- [ ] Monorepo funcionando
- [ ] API Fastify
- [ ] Dashboard React
- [ ] Workers con BullMQ
- [ ] PostgreSQL + Redis
- [ ] Logs estructurados
- [ ] `.env` centralizado
- [ ] Docker Compose

## Fase 1 — Modelo de datos
### Tablas
- [ ] `sources`
- [ ] `properties`
- [ ] `property_images`
- [ ] `property_duplicates`
- [ ] `crawl_jobs`

### Campos mínimos
- [ ] portal
- [ ] listing_url
- [ ] external_id
- [ ] operation_type
- [ ] property_type
- [ ] department
- [ ] city
- [ ] neighborhood
- [ ] address_text
- [ ] price
- [ ] currency
- [ ] bedrooms
- [ ] bathrooms
- [ ] covered_m2
- [ ] total_m2
- [ ] garage
- [ ] title
- [ ] description
- [ ] agency_name
- [ ] published_at_source
- [ ] updated_at_source

## Fase 2 — Infra de crawling
- [ ] Scheduler por portal
- [ ] Cola `crawl:list`
- [ ] Cola `crawl:detail`
- [ ] Cola `normalize`
- [ ] Cola `dedupe`
- [ ] Reintentos
- [ ] Rate limit por portal
- [ ] Persistir raw HTML/JSON
- [ ] Métricas por corrida

## Fase 3 — Conectores prioritarios
### Orden
1. Gallito
2. Casasweb
3. InfoCasas
4. REMAX
5. Casas y Más
6. Mercado Libre

### Estrategia sugerida
- Gallito: HTTP + parser
- Casasweb: HTTP + parser
- InfoCasas: HTTP + parser, Puppeteer fallback
- REMAX: Puppeteer first
- Casas y Más: Puppeteer first
- Mercado Libre: revisar API/endpoints antes de scraping visual

## Fase 4 — Contrato por conector
Cada conector debe implementar:
- [ ] `discoverListingUrls()`
- [ ] `parseListingPage()`
- [ ] `parseDetailPage()`
- [ ] `normalizeProperty()`
- [ ] `extractExternalId()`

## Fase 5 — Dedupe
### Score por:
- [ ] external_id
- [ ] URL canónica
- [ ] agencia
- [ ] teléfono
- [ ] dirección similar
- [ ] precio con tolerancia
- [ ] m2
- [ ] dormitorios/baños
- [ ] similitud título/descripción
- [ ] hash perceptual de imágenes

### Reglas
- [ ] score > 0.95 => duplicado automático
- [ ] 0.80 - 0.95 => revisión manual
- [ ] < 0.80 => mantener separado

## Fase 6 — Detección de cambios
- [ ] nueva propiedad
- [ ] propiedad actualizada
- [ ] sospecha de baja
- [ ] baja confirmada
- [ ] error de crawl

## Fase 7 — Dashboard
- [ ] jobs recientes
- [ ] errores recientes
- [ ] nuevos avisos
- [ ] actualizaciones
- [ ] inactivos
- [ ] duplicados detectados
- [ ] búsqueda por portal / URL / zona / id externo

## Fase 8 — Calidad
- [ ] tests unitarios de parser
- [ ] snapshots HTML por portal
- [ ] fixtures por página
- [ ] retry policy
- [ ] observabilidad
- [ ] alertas por caída de extracción

## Fase 9 — Producción
- [ ] despliegue
- [ ] backups
- [ ] rotación de logs
- [ ] política de imágenes
- [ ] validación legal y de términos de uso
