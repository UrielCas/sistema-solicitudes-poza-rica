import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../core/network/axiosClient';
import { AppLayout } from '../../shared/components/AppLayout';

export const AreasPage = () => {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [siglas, setSiglas] = useState('');

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => (await axiosClient.get('/areas')).data.data,
  });

  const addMutation = useMutation({
    mutationFn: () => axiosClient.post('/areas', { nombre, siglas }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setNombre('');
      setSiglas('');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !siglas.trim()) return;
    addMutation.mutate();
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#292b34]">Usuarios y áreas</h1>
          <p className="text-sm text-[#707784]">Catálogo oficial de {areas.length} dependencias municipales</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-[#e3e5e9] flex flex-wrap gap-3">
          <input
            required
            placeholder="Nombre de la nueva dependencia"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
          />
          <input
            required
            placeholder="Siglas"
            value={siglas}
            onChange={(e) => setSiglas(e.target.value)}
            className="w-28 px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#731936] hover:bg-[#4b1027] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            + Agregar área
          </button>
        </form>

        <div className="bg-white rounded-xl border border-[#e3e5e9] divide-y divide-[#e3e5e9]">
          {areas.map((a: any, idx: number) => (
            <div key={a._id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span>
                <strong className="text-[#731936] mr-2">{idx + 1}.</strong>
                {a.nombre}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f2e7ed] text-[#731936]">
                {a.siglas}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};