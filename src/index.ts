import express from 'express'
import cors from 'cors'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { router } from './routes'
import { swaggerSpec } from './swagger'

const app = express()
const PORT = process.env.PORT || 3000

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Frontend estático ──────────────────────────────────────────────────────
// process.cwd() aponta para node-api/ tanto em dev quanto em produção
const frontendPath = path.join(process.cwd(), '..', 'frontend')
app.use(express.static(frontendPath))

// ── Swagger ────────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── Rotas da API ───────────────────────────────────────────────────────────
app.use(router)

// ── 404 para rotas desconhecidas ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// ── Iniciar servidor ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em    http://localhost:${PORT}`)
  console.log(`📖 Swagger em        http://localhost:${PORT}/docs`)
  console.log(`🦀 Engine            Rust FFI\n`)
})

