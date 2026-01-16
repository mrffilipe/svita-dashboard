/**
 * Formata CPF ou CNPJ para exibição
 * CPF: 000.000.000-00
 * CNPJ: 00.000.000/0000-00
 */
export const formatCpfCnpj = (value: string | { value: string }): string => {
  const cpfCnpj = typeof value === 'string' ? value : value.value;
  const numbers = cpfCnpj.replace(/\D/g, '');

  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return cpfCnpj;
};

/**
 * Formata telefone para exibição, removendo prefixo +55 ou 55
 * Formato: (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (value: string | { value: string }): string => {
  const phone = typeof value === 'string' ? value : value.value;
  
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove prefixo 55 (com ou sem +) se existir
  if (cleaned.startsWith('55') && cleaned.length > 11) {
    cleaned = cleaned.substring(2);
  }

  if (cleaned.length === 11) {
    // Celular: (00) 9 0000-0000
    return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
  } else if (cleaned.length === 10) {
    // Fixo: (00) 0000-0000
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

/**
 * Formata email para exibição (lowercase)
 */
export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};
