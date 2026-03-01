import koffi from 'koffi'
import path from 'path'

const ext =
  process.platform === 'win32'  ? '.dll'   :
  process.platform === 'darwin' ? '.dylib' : '.so'

const libPath = path.join(
  __dirname,
  '../rust-validation-api/target/release/validator' + ext
)

type RustLib = {
  validateCpf:      (v: string) => boolean
  validateCnpj:     (v: string) => boolean
  validateEmail:    (v: string) => boolean
  validatePhone:    (v: string) => boolean
  validateCep:      (v: string) => boolean
  validateNumber:   (v: string) => boolean
  passwordStrength: (v: string) => string
}

function loadLib(): RustLib {
  const lib = koffi.load(libPath)

  // funções que retornam bool
  const ffi_cpf    = lib.func('validate_cpf',    'bool', ['string'])
  const ffi_cnpj   = lib.func('validate_cnpj',   'bool', ['string'])
  const ffi_email  = lib.func('validate_email',  'bool', ['string'])
  const ffi_phone  = lib.func('validate_phone',  'bool', ['string'])
  const ffi_cep    = lib.func('validate_cep',    'bool', ['string'])
  const ffi_number = lib.func('validate_number', 'bool', ['string'])

  // função que retorna string alocada em Rust
  const ffi_password = lib.func('password_strength', 'uintptr', ['string'])
  const ffi_free     = lib.func('free_string', 'void', ['uintptr'])

  return {
    validateCpf:    (v) => ffi_cpf(v) as boolean,
    validateCnpj:   (v) => ffi_cnpj(v) as boolean,
    validateEmail:  (v) => ffi_email(v) as boolean,
    validatePhone:  (v) => ffi_phone(v) as boolean,
    validateCep:    (v) => ffi_cep(v) as boolean,
    validateNumber: (v) => ffi_number(v) as boolean,

    passwordStrength: (v) => {
      const ptr = ffi_password(v)
      if (!ptr) return 'weak'
      const result = koffi.decode(ptr, 'string') as string
      ffi_free(ptr)
      return result
    },
  }
}

function initLib(): RustLib {
  try {
    const lib = loadLib()
    console.log('✅ Rust FFI carregado com sucesso')
    return lib
  } catch (err) {
    console.error('❌ Falha ao carregar libvalidator:', err)
    console.error('   Execute: cd rust-validation-api && cargo build --release')
    process.exit(1)
  }
}

export const rustLib: RustLib = initLib()