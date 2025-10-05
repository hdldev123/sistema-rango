/**
 * Função utilitária para simular a latência de uma chamada de API.
 * Envolve uma operação em uma Promise que resolve após um tempo aleatório.
 * @param {function} operacao - A função que contém a lógica a ser executada.
 * @returns {Promise} Uma Promise que resolve com o resultado da operação.
 */
export const simularLatencia = (operacao) => {
    return new Promise(resolve => {
      // Simula um atraso de rede entre 500ms e 1000ms
      const delay = Math.random() * 500 + 500;
      setTimeout(() => {
        const resultado = operacao();
        resolve(resultado);
      }, delay);
    });
};
