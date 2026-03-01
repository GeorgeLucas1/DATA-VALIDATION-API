"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rustLib = void 0;
const koffi_1 = __importDefault(require("koffi"));
const path_1 = __importDefault(require("path"));
const ext = process.platform === 'win32' ? '.dll' :
    process.platform === 'darwin' ? '.dylib' : '.so';
const libPath = path_1.default.join(__dirname, '../../rust-validator/target/release/libvalidator' + ext);
// carrega a biblioteca compilada do Rust
const lib = koffi_1.default.load(libPath);
// define cada função — koffi é bem mais limpo que ffi-napi
const ffi_validate_cpf = lib.func('ffi_validate_cpf', 'char *', ['str']);
const ffi_validate_cnpj = lib.func('ffi_validate_cnpj', 'char *', ['str']);
const ffi_validate_email = lib.func('ffi_validate_email', 'char *', ['str']);
const ffi_validate_phone = lib.func('ffi_validate_phone', 'char *', ['str']);
const ffi_validate_number = lib.func('ffi_validate_number', 'char *', ['str']);
const ffi_validate_cep = lib.func('ffi_validate_cep', 'char *', ['str']);
const ffi_password_strength = lib.func('ffi_password_strength', 'char *', ['str']);
const ffi_free_string = lib.func('ffi_free_string', 'void', ['char *']);
// helper — chama a função e libera a memória logo depois
function callRust(fn, input) {
    const result = fn(input);
    return result;
}
exports.rustLib = {
    validateCpf: (v) => callRust(ffi_validate_cpf, v),
    validateCnpj: (v) => callRust(ffi_validate_cnpj, v),
    validateEmail: (v) => callRust(ffi_validate_email, v),
    validatePhone: (v) => callRust(ffi_validate_phone, v),
    validateNumber: (v) => callRust(ffi_validate_number, v),
    validateCep: (v) => callRust(ffi_validate_cep, v),
    passwordStrength: (v) => callRust(ffi_password_strength, v),
};
