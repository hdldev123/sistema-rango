import { simularLatencia } from './api';
import usuarios from '../mock/usuarios.json';

export const apiLogin = (email, senha) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuarioEncontrado = usuarios.find(
        u => u.email === email && u.senha === senha // Em um app real, use bcrypt para comparar hashes de senha
      );

      if (usuarioEncontrado) {
        const { senha, ...dadosUsuario } = usuarioEncontrado;
        resolve({
          token: 'token_jwt_simulado_12345',
          usuario: dadosUsuario,
        });
      } else {
        reject(new Error('Credenciais inválidas'));
      }
    }, 1000); // Latência fixa de 1s para login
  });
};

export const apiLogout = () => {
    // Em um app real, você poderia invalidar o token no backend
    console.log("Logout realizado, token invalidado (simulação).");
    return Promise.resolve();
}
