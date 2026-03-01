# 🚀 Node.js + Rust FFI: High-Performance Data Validation Service

[![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-green.svg)](#português)
[![Language: English](https://img.shields.io/badge/Language-English-blue.svg)](#english)

---

## 🇧🇷 Português

### 📝 Sobre o Projeto
Esta é uma **API de alto desempenho** desenvolvida em **Node.js** que utiliza **Rust** via **FFI (Foreign Function Interface)** para o processamento intensivo de dados. O objetivo principal é demonstrar como delegar tarefas computacionalmente pesadas (como validações complexas de Regex) para uma linguagem de sistema, garantindo tempos de resposta extremamente curtos e maior eficiência.

### 🚀 Funcionalidades
O serviço é capaz de processar e validar dados de forma rápida e eficaz:
- **Documentos:** Validação de CPF e CNPJ.
- **Contato:** Verificação de e-mail e números de telefone.
- **Localização:** Formatação e validação de CEP.
- **Customização:** Suporte para padrões de Regex personalizados definidos pelo usuário.

### 🛠️ Tecnologias Utilizadas
- **Runtime:** Node.js (com framework Express)
- **Linguagem de Baixo Nível:** Rust (com binding via FFI)
- **Interface FFI:** `koffi` ou `ffi-napi` para comunicação entre linguagens.

### 💡 Por que Rust no backend Node.js?
Embora Node.js seja excelente para lidar com operações de I/O não bloqueantes, ele pode ter um desempenho inferior ao lidar com cálculos matemáticos ou lógicos pesados. Ao integrar Rust, obtemos:
1. **Performance superior:** Velocidade de execução próxima à do hardware.
2. **Segurança de Memória:** Garantia de robustez contra violações de acesso.
3. **Escalabilidade:** Menor sobrecarga de processamento, permitindo mais requisições simultâneas.

---

## 🇺🇸 English

### 📝 About the Project
This is a **high-performance API** built with **Node.js** that leverages **Rust** through **FFI (Foreign Function Interface)** for computationally intensive tasks. The project demonstrates the power of delegating complex processing (like advanced Regex matching) to a systems language, ensuring minimal latency and optimal resource usage.

### 🚀 Key Features
The system provides fast and reliable validation for:
- **Identity Documents:** CPF and other tax identification numbers.
- **Contact Info:** Email addresses and international phone formats.
- **Location Data:** Postal codes (CEP) and address verification.
- **Custom Patterns:** Support for user-defined regular expressions.

### 🛠️ Tech Stack
- **Runtime:** Node.js (with Express Framework)
- **Core Engine:** Rust (FFI-enabled)
- **Binding Library:** `koffi` or `ffi-napi` for seamless cross-language integration.

### 💡 Why combine Node.js with Rust?
While Node.js excels at handling high-volume, non-blocking I/O operations, it can experience performance bottlenecks when dealing with heavy mathematical or logical computations. By offloading such logic to a compiled language like Rust, you gain:
1. **Unmatched Speed:** Near-native execution speeds for complex logic.
2. **Memory Safety:** Rust's ownership model eliminates common memory-related bugs and vulnerabilities.
3. **Efficiency:** Lower CPU usage compared to pure JavaScript implementations, leading to better scalability.

---


---
**Desenvolvido com ❤️ **
