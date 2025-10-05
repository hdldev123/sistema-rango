import { simularLatencia } from './api';
import usuariosMock from '../mock/usuarios.json';

let usuariosEmMemoria = usuariosMock.map(({ senha, ...user }) => user); // Remove a senha

export const buscarUsuarios = (params = {}) => {
  return simularLatencia(() => {
    return {
      dados: usuariosEmMemoria,
      totalItens: usuariosEmMemoria.length,
    };
  });
};
