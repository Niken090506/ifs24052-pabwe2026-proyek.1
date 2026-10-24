import { ref } from "vue";

/**
 * Custom Vue composable untuk mengelola input state dan event change handler.
 * @param {string} defaultValue - Nilai inisial input string.
 * @returns {[import('vue').Ref<string>, function(any): void, function(string): void]}
 */
export default function useInput(defaultValue = "") {
  const value = ref(defaultValue);

  function handleValueChange(event) {
    value.value = event?.target?.value !== undefined ? event.target.value : event;
  }

  return [value, handleValueChange, (val) => { value.value = val; }];
}
