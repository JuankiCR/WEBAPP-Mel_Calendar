// src/store/useNotasStore.ts
import { create } from 'zustand';
import {
  Nota,
  TipoNota,
  getNotasUsuario,
  crearNota,
  eliminarNota,
  actualizarNota as actualizarNotaService,
} from '../services/notas';

type CrearNotaInput = {
  fecha: string;
  texto: string;
  tipo?: TipoNota;
  imagenId?: string;
  videoId?: string;
};

type ActualizarNotaInput = Partial<
  Pick<Nota, 'texto' | 'tipo' | 'fecha' | 'imagenId' | 'videoId'>
>;

type NotasState = {
  notas: Nota[];
  cargando: boolean;
  error?: string;
  cargarNotas: () => Promise<void>;
  agregarNota: (data: CrearNotaInput) => Promise<Nota>;
  actualizarNota: (id: string, data: ActualizarNotaInput) => Promise<Nota>;
  borrarNota: (id: string) => Promise<void>;
  resetNotas: () => void;
};

export const useNotasStore = create<NotasState>((set, get) => ({
  notas: [],
  cargando: false,
  error: undefined,

  cargarNotas: async () => {
    set({ cargando: true, error: undefined });
    try {
      const notas = await getNotasUsuario();
      set({ notas, cargando: false });
    } catch (e: any) {
      set({ error: e.message, cargando: false });
    }
  },

  agregarNota: async (data) => {
    const nota = await crearNota(data);
    set({ notas: [nota, ...get().notas] });
    return nota;
  },

  actualizarNota: async (id, data) => {
    const notaActualizada = await actualizarNotaService(id, data);
    set({
      notas: get().notas.map((n) =>
        n.$id === id ? notaActualizada : n
      ),
    });
    return notaActualizada;
  },

  borrarNota: async (id) => {
    set({ cargando: true });
    await eliminarNota(id);
    set({
      notas: get().notas.filter((n) => n.$id !== id),
      cargando: false,
    });
  },

  resetNotas: () => set({ notas: [] }),
}));
