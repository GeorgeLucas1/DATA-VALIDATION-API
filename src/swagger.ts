import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataShield Validator API',
      version: '1.0.0',
      description: 'API de validação de dados brasileiros com engine Rust via FFI',
      contact: {
        name: 'DataShield',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desenvolvimento local' }
    ],
    tags: [
      { name: 'Validação', description: 'Endpoints de validação de dados' },
      { name: 'Sistema',   description: 'Endpoints de sistema' },
    ],
    components: {
      schemas: {
        ValidatorType: {
          type: 'string',
          enum: ['cpf', 'cnpj', 'email', 'phone', 'number', 'cep', 'password'],
        },
        ValidateRequest: {
          type: 'object',
          required: ['type', 'value'],
          properties: {
            type: { $ref: '#/components/schemas/ValidatorType' },
            value: { type: 'string', example: '529.982.247-25' },
          },
        },
        ValidateResponse: {
          type: 'object',
          properties: {
            type:     { type: 'string' },
            value:    { type: 'string' },
            valid:    { type: 'boolean' },
            strength: { type: 'string', enum: ['weak', 'medium', 'strong'] },
            source:   { type: 'string', example: 'rust' },
          },
        },
        BatchField: {
          type: 'object',
          required: ['type', 'value'],
          properties: {
            type:  { $ref: '#/components/schemas/ValidatorType' },
            value: { type: 'string' },
            label: { type: 'string' },
          },
        },
        BatchRequest: {
          type: 'object',
          required: ['fields'],
          properties: {
            fields: {
              type: 'array',
              items: { $ref: '#/components/schemas/BatchField' },
            },
          },
        },
        BatchResponse: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            results: {
              type: 'array',
              items: { $ref: '#/components/schemas/ValidateResponse' },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)