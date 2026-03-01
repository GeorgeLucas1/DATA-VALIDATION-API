use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::ptr;

// ── Funções internas ────────────────────────────────────────────────────────

fn validate_cpf_internal(cpf: &str) -> bool {
    let digits: Vec<u32> = cpf
        .chars()
        .filter(|c| c.is_ascii_digit())
        .filter_map(|c| c.to_digit(10))
        .collect();

    if digits.len() != 11 { return false; }
    if digits.iter().all(|&d| d == digits[0]) { return false; }

    let mut sum = 0;
    for i in 0..9 { sum += digits[i] * (10 - i as u32); }
    let mut d1 = (sum * 10) % 11;
    if d1 == 10 { d1 = 0; }
    if d1 != digits[9] { return false; }

    let mut sum = 0;
    for i in 0..10 { sum += digits[i] * (11 - i as u32); }
    let mut d2 = (sum * 10) % 11;
    if d2 == 10 { d2 = 0; }
    d2 == digits[10]
}

fn validate_cnpj_internal(cnpj: &str) -> bool {
    let digits: Vec<u32> = cnpj
        .chars()
        .filter(|c| c.is_ascii_digit())
        .filter_map(|c| c.to_digit(10))
        .collect();

    if digits.len() != 14 { return false; }
    if digits.iter().all(|&d| d == digits[0]) { return false; }

    let w1 = [5u32, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum1: u32 = digits[..12].iter().zip(w1.iter()).map(|(&d, &w)| d * w).sum();
    let d1 = match sum1 % 11 { r if r < 2 => 0, r => 11 - r };

    let w2 = [6u32, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum2: u32 = digits[..13].iter().zip(w2.iter()).map(|(&d, &w)| d * w).sum();
    let d2 = match sum2 % 11 { r if r < 2 => 0, r => 11 - r };

    d1 == digits[12] && d2 == digits[13]
}

fn validate_email_internal(email: &str) -> bool {
    let parts: Vec<&str> = email.splitn(2, '@').collect();
    if parts.len() != 2 { return false; }
    let local = parts[0];
    let domain = parts[1];
    if local.is_empty() || domain.is_empty() { return false; }
    if !domain.contains('.') { return false; }
    let tld = domain.rsplit('.').next().unwrap_or("");
    tld.len() >= 2
}

fn validate_phone_internal(phone: &str) -> bool {
    let digits: String = phone.chars().filter(|c| c.is_ascii_digit()).collect();
    digits.len() == 10 || digits.len() == 11
}

fn validate_cep_internal(cep: &str) -> bool {
    let digits: String = cep.chars().filter(|c| c.is_ascii_digit()).collect();
    digits.len() == 8
}

fn validate_number_internal(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() { return false; }
    trimmed.parse::<f64>().is_ok()
}

fn password_strength_internal(password: &str) -> &'static str {
    let upper   = password.chars().any(|c| c.is_uppercase());
    let lower   = password.chars().any(|c| c.is_lowercase());
    let digit   = password.chars().any(|c| c.is_ascii_digit());
    let special = password.chars().any(|c| !c.is_alphanumeric());
    let score   = [upper, lower, digit, special].iter().filter(|&&b| b).count();

    if password.len() >= 12 && score == 4 { return "strong"; }
    if password.len() >= 8  && score >= 3 { return "medium"; }
    "weak"
}

// ── Helper ──────────────────────────────────────────────────────────────────

fn str_to_owned(ptr: *const c_char) -> Option<String> {
    if ptr.is_null() { return None; }
    unsafe {
        CStr::from_ptr(ptr).to_str().ok().map(|s| s.to_owned())
    }
}

// ── FFI Exports ─────────────────────────────────────────────────────────────

#[unsafe(no_mangle)]
pub extern "C" fn validate_cpf(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_cpf_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn validate_cnpj(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_cnpj_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn validate_email(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_email_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn validate_phone(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_phone_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn validate_cep(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_cep_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn validate_number(ptr: *const c_char) -> bool {
    str_to_owned(ptr).map(|s| validate_number_internal(&s)).unwrap_or(false)
}

#[unsafe(no_mangle)]
pub extern "C" fn password_strength(ptr: *const c_char) -> *mut c_char {
    let s = match str_to_owned(ptr) {
        Some(s) => s,
        None => return ptr::null_mut(),
    };
    match CString::new(password_strength_internal(&s)) {
        Ok(c) => c.into_raw(),
        Err(_) => ptr::null_mut(),
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn free_string(ptr: *mut c_char) {
    if ptr.is_null() { return; }
    unsafe { drop(CString::from_raw(ptr)); }
}