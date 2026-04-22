/**
 * @file useAuthValidators.js
 * @description Validaciones de los formularios de acceso (email + contraseña).
 * Lo saqué a composable porque las reutilizo entre Login y Register, y así
 * las vistas no cargan con la misma regex repetida. Lo paso a `ref` para
 * que las comprobaciones sean reactivas sin tener que pasar primitivas.
 */

import { computed } from 'vue';

/**
 * @param {import('vue').Ref<string>} [email=null] - Ref con el correo del usuario.
 * @param {import('vue').Ref<string>} [password=null] - Ref con la contraseña.
 * @returns {{
 *   isEmailValid: import('vue').ComputedRef<boolean>,
 *   hasLength: import('vue').ComputedRef<boolean>,
 *   hasUppercase: import('vue').ComputedRef<boolean>,
 *   hasNumberOrSpecial: import('vue').ComputedRef<boolean>,
 *   isPasswordValid: import('vue').ComputedRef<boolean>
 * }}
 */
export function useAuthValidators(email = null, password = null) {

  /**
   * Formato de email válido. Aplico trim() porque algunos teclados móviles
   * meten un espacio después del autocompletado. No pretendo cubrir todos
   * los RFC raros, sólo el 99% real.
   */
  const isEmailValid = computed(() => {
    if (!email || !email.value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.value.trim());
  });

  // --- Requisitos de la contraseña ---

  /** Al menos 8 caracteres. */
  const hasLength = computed(() => (password?.value?.length || 0) >= 8);

  /** Al menos una mayúscula. */
  const hasUppercase = computed(() => /[A-Z]/.test(password?.value || ''));

  /** Al menos un número o un carácter especial. */
  const hasNumberOrSpecial = computed(() => /[\d\W]/.test(password?.value || ''));

  /** La contraseña sólo pasa si cumple los tres requisitos anteriores a la vez. */
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
