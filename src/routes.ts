import { Router, Request, Response } from 'express'
import { validate, validateBatch, isValidType, BatchField } from './validator'

export const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidatorType:
 *       type: string
 *       enum: [cpf, cnpj, email, phone, number, cep, password]
 *       description: |
 *         Tipos de validação disponíveis:
 *         - **cpf** → Cadastro de Pessoa Física (ex: 529.982.247-25 ou 52998224725)
 *         - **cnpj** → Cadastro Nacional de Pessoa Jurídica (ex: 11.222.333/0001-81)
 *         - **email** → Endereço de e-mail (ex: usuario@dominio.com.br)
 *         - **phone** → Telefone brasileiro com DDD, 10 ou 11 dígitos (ex: (11) 99999-9999)
 *         - **number** → Número inteiro, decimal ou negativo (ex: 42, 3.14, -100)
 *         - **cep** → Código de Endereçamento Postal (ex: 01310-100 ou 01310100)
 *         - **password** → Força da senha — retorna weak, medium ou strong
 *
 *     ValidateRequest:
 *       type: object
 *       required: [type, value]
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/ValidatorType'
 *         value:
 *           type: string
 *           description: Valor a ser validado
 *       examples:
 *         cpf_valido:
 *           summary: CPF válido com máscara
 *           value: { type: cpf, value: "529.982.247-25" }
 *         cpf_sem_mascara:
 *           summary: CPF válido sem máscara
 *           value: { type: cpf, value: "52998224725" }
 *         cnpj_valido:
 *           summary: CNPJ válido
 *           value: { type: cnpj, value: "11.222.333/0001-81" }
 *         email_valido:
 *           summary: E-mail válido
 *           value: { type: email, value: "usuario@empresa.com.br" }
 *         telefone_celular:
 *           summary: Celular com DDD
 *           value: { type: phone, value: "(11) 99999-9999" }
 *         telefone_fixo:
 *           summary: Telefone fixo com DDD
 *           value: { type: phone, value: "(11) 3333-4444" }
 *         cep_com_hifen:
 *           summary: CEP com hífen
 *           value: { type: cep, value: "01310-100" }
 *         cep_sem_hifen:
 *           summary: CEP sem hífen
 *           value: { type: cep, value: "01310100" }
 *         numero_inteiro:
 *           summary: Número inteiro
 *           value: { type: number, value: "42" }
 *         numero_decimal:
 *           summary: Número decimal
 *           value: { type: number, value: "3.14" }
 *         numero_negativo:
 *           summary: Número negativo
 *           value: { type: number, value: "-100" }
 *         senha_forte:
 *           summary: Senha forte
 *           value: { type: password, value: "Abc123!@#xyz" }
 *         senha_media:
 *           summary: Senha média
 *           value: { type: password, value: "Abcd1234" }
 *         senha_fraca:
 *           summary: Senha fraca
 *           value: { type: password, value: "abc123" }
 *
 *     ValidateResponse:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Tipo validado
 *           example: cpf
 *         value:
 *           type: string
 *           description: Valor que foi validado
 *           example: "529.982.247-25"
 *         valid:
 *           type: boolean
 *           description: Resultado da validação (não presente para tipo password)
 *           example: true
 *         strength:
 *           type: string
 *           enum: [weak, medium, strong]
 *           description: |
 *             Força da senha (somente para tipo password):
 *             - **weak** → menos de 8 caracteres ou poucos critérios
 *             - **medium** → 8+ caracteres com letras maiúsculas, minúsculas e números
 *             - **strong** → 12+ caracteres com maiúsculas, minúsculas, números e especiais
 *           example: strong
 *         source:
 *           type: string
 *           description: Engine que processou a validação
 *           example: rust
 *
 *     BatchField:
 *       type: object
 *       required: [type, value]
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/ValidatorType'
 *         value:
 *           type: string
 *           description: Valor a ser validado
 *         label:
 *           type: string
 *           description: Nome amigável do campo (opcional, aparece no resultado)
 *           example: CPF do cliente
 *
 *     BatchRequest:
 *       type: object
 *       required: [fields]
 *       properties:
 *         fields:
 *           type: array
 *           minItems: 1
 *           description: Lista de campos para validar
 *           items:
 *             $ref: '#/components/schemas/BatchField'
 *       example:
 *         fields:
 *           - { type: cpf,      value: "529.982.247-25",     label: "CPF do cliente" }
 *           - { type: cnpj,     value: "11.222.333/0001-81", label: "CNPJ da empresa" }
 *           - { type: email,    value: "user@empresa.com.br",label: "E-mail" }
 *           - { type: phone,    value: "(11) 99999-9999",    label: "Celular" }
 *           - { type: cep,      value: "01310-100",          label: "CEP" }
 *           - { type: password, value: "Abc123!@#xyz",       label: "Senha" }
 *
 *     BatchResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de campos validados
 *           example: 6
 *         results:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/BatchField'
 *               - $ref: '#/components/schemas/ValidateResponse'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *           example: Parâmetros type e value são obrigatórios
 *         validos:
 *           type: array
 *           description: Lista de tipos aceitos (presente quando o tipo é inválido)
 *           items:
 *             type: string
 *           example: [cpf, cnpj, email, phone, number, cep, password]
 */

/**
 * @swagger
 * /validate:
 *   post:
 *     tags: [Validação]
 *     summary: Valida um campo individual
 *     description: |
 *       Valida um único valor usando a engine Rust via FFI.
 *
 *       **Regras por tipo:**
 *       | Tipo | Regra |
 *       |------|-------|
 *       | cpf | 11 dígitos + algoritmo da Receita Federal |
 *       | cnpj | 14 dígitos + algoritmo da RFB |
 *       | email | formato local@dominio.tld |
 *       | phone | DDD + 8 ou 9 dígitos |
 *       | cep | 8 dígitos com ou sem hífen |
 *       | number | inteiro, decimal ou negativo |
 *       | password | retorna weak / medium / strong |
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateRequest'
 *           examples:
 *             cpf:
 *               summary: Validar CPF
 *               value: { type: cpf, value: "529.982.247-25" }
 *             cnpj:
 *               summary: Validar CNPJ
 *               value: { type: cnpj, value: "11.222.333/0001-81" }
 *             email:
 *               summary: Validar e-mail
 *               value: { type: email, value: "usuario@empresa.com.br" }
 *             phone:
 *               summary: Validar telefone
 *               value: { type: phone, value: "(11) 99999-9999" }
 *             cep:
 *               summary: Validar CEP
 *               value: { type: cep, value: "01310-100" }
 *             number:
 *               summary: Validar número
 *               value: { type: number, value: "3.14" }
 *             password:
 *               summary: Analisar senha
 *               value: { type: password, value: "Abc123!@#xyz" }
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidateResponse'
 *             examples:
 *               cpf_valido:
 *                 summary: CPF válido
 *                 value: { type: cpf, value: "529.982.247-25", valid: true, source: rust }
 *               cpf_invalido:
 *                 summary: CPF inválido
 *                 value: { type: cpf, value: "111.111.111-11", valid: false, source: rust }
 *               senha_forte:
 *                 summary: Senha forte
 *                 value: { type: password, value: "Abc123!@#xyz", strength: strong, source: rust }
 *               senha_fraca:
 *                 summary: Senha fraca
 *                 value: { type: password, value: "abc", strength: weak, source: rust }
 *       400:
 *         description: Parâmetros inválidos ou tipo não suportado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sem_parametros:
 *                 summary: Sem parâmetros
 *                 value: { error: "Parâmetros type e value são obrigatórios" }
 *               tipo_invalido:
 *                 summary: Tipo inválido
 *                 value: { error: "Tipo inválido: \"rg\"", validos: [cpf, cnpj, email, phone, number, cep, password] }
 *       500:
 *         description: Erro interno na engine Rust
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/validate', (req: Request, res: Response) => {
  const { type, value } = req.body

  if (!type || value === undefined) {
    res.status(400).json({ error: 'Parâmetros type e value são obrigatórios' })
    return
  }

  if (!isValidType(type)) {
    res.status(400).json({
      error: `Tipo inválido: "${type}"`,
      validos: ['cpf', 'cnpj', 'email', 'phone', 'number', 'cep', 'password']
    })
    return
  }

  try {
    const result = validate(type, value)
    res.json({ type, value, ...result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    res.status(500).json({ error: message })
  }
})

/**
 * @swagger
 * /validate/batch:
 *   post:
 *     tags: [Validação]
 *     summary: Valida múltiplos campos de uma vez
 *     description: |
 *       Envia um array de campos e recebe todos os resultados em uma única chamada.
 *       Ideal para validar formulários inteiros de uma só vez.
 *
 *       Campos com erro individual não interrompem o batch — o erro aparece apenas naquele item.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchRequest'
 *     responses:
 *       200:
 *         description: Todos os campos foram processados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchResponse'
 *             example:
 *               total: 3
 *               results:
 *                 - { label: "CPF", type: cpf, value: "529.982.247-25", valid: true, source: rust }
 *                 - { label: "E-mail", type: email, value: "user@empresa.com.br", valid: true, source: rust }
 *                 - { label: "Senha", type: password, value: "Abc123!@#xyz", strength: strong, source: rust }
 *       400:
 *         description: Array inválido ou vazio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               array_vazio:
 *                 summary: Array vazio
 *                 value: { error: "fields deve ser um array não vazio" }
 *               tipo_invalido:
 *                 summary: Tipo inválido no batch
 *                 value: { error: "Tipo inválido no batch: \"rg\"" }
 */
router.post('/validate/batch', (req: Request, res: Response) => {
  const { fields } = req.body

  if (!Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: 'fields deve ser um array não vazio' })
    return
  }

  const invalid = fields.find((f: BatchField) => !isValidType(f.type))
  if (invalid) {
    res.status(400).json({ error: `Tipo inválido no batch: "${invalid.type}"` })
    return
  }

  const results = validateBatch(fields as BatchField[])
  res.json({ total: results.length, results })
})

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Sistema]
 *     summary: Verifica status da API
 *     description: Retorna se a API está no ar e qual engine está sendo usada.
 *     responses:
 *       200:
 *         description: API online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 engine:
 *                   type: string
 *                   example: rust-ffi
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', engine: 'rust-ffi' })
})