import { rustLib } from './ffi'

export type ValidatorType =
  | 'cpf' | 'cnpj' | 'email' | 'phone'
  | 'number' | 'cep' | 'password'

export type ValidationResult =
  | { valid: boolean;                               source: 'rust' }
  | { strength: 'weak' | 'medium' | 'strong';      source: 'rust' }

export type BatchField = {
  type: ValidatorType
  value: string
  label?: string
}

export type BatchResult = BatchField & (ValidationResult | { error: string })

const VALID_TYPES: ValidatorType[] = [
  'cpf', 'cnpj', 'email', 'phone', 'number', 'cep', 'password'
]

export function isValidType(type: string): type is ValidatorType {
  return VALID_TYPES.includes(type as ValidatorType)
}

export function validate(type: ValidatorType, value: string): ValidationResult {
  switch (type) {
    case 'cpf':      return { valid: rustLib.validateCpf(value),    source: 'rust' }
    case 'cnpj':     return { valid: rustLib.validateCnpj(value),   source: 'rust' }
    case 'email':    return { valid: rustLib.validateEmail(value),   source: 'rust' }
    case 'phone':    return { valid: rustLib.validatePhone(value),   source: 'rust' }
    case 'cep':      return { valid: rustLib.validateCep(value),     source: 'rust' }
    case 'number':   return { valid: rustLib.validateNumber(value),  source: 'rust' }
    case 'password': return {
      strength: rustLib.passwordStrength(value) as 'weak' | 'medium' | 'strong',
      source: 'rust'
    }
  }
}

export function validateBatch(fields: BatchField[]): BatchResult[] {
  return fields.map((field) => {
    try {
      return { ...field, ...validate(field.type, field.value) }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Erro desconhecido'
      return { ...field, error }
    }
  })
}