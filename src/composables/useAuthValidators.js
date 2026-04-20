/**
 * @file useAuthValidators.js
 * @description Composable para centralizar las validaciones de los formularios de acceso.
 * Mantiene las vistas limpias y reutiliza la lógica de control de seguridad.
 */

import { computed } from 'vue';

/**
 * Hook para validar credenciales de usuario (email y contraseña).
 * @param {Ref} [email=null] - Referencia reactiva con el correo del usuario.
 * @param {Ref} [password=null] - Referencia reactiva con la contraseña del usuario.
 * @returns {Object} Banderas de validación individuales y estados globales de validez.
 */
export function useAuthValidators(email = null, password = null) {
  
  /**
   * Valida el formato del email mediante una expresión regular estándar.
   * Aplicamos trim() para ignorar espacios en blanco accidentales al principio o final.
   */
  const isEmailValid = computed(() => {
    if (!email || !email.value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.value.trim());
  });

  // --- Requisitos de seguridad para la contraseña ---
  
  /** Verifica que la contraseña tenga al menos 8 caracteres */
  const hasLength = computed(() => (password?.value?.length || 0) >= 8);
  
  /** Comprueba si hay al menos una letra mayúscula */
  const hasUppercase = computed(() => /[A-Z]/.test(password?.value || ''));
  
  /** Busca la presencia de un número o un carácter especial */
  const hasNumberOrSpecial = computed(() => /[\d\W]/.test(password?.value || ''));

  /**
   * El password global se da por bueno solo si pasa todos los filtros individuales.
   */
  const isPasswordValid = computed(() => 
    hasLength.value && 
    hasUppercase.value && 
    hasNumberOrSpecial.value
  );

  return {
    isEmailValid,
    hasLength,
    hasUppercase,
    hasNumberOrSpecial,
    isPasswordValid
  };
}