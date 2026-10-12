const postTypes = ['Adopción', 'Animal perdido', 'Rescate', 'Pedido de ayuda', 'Actividad comunitaria'];

export function PostForm() {
  return (
    <form className="space-y-4 rounded-2xl border border-[#e0e7dc] bg-white p-5">
      <label className="block text-sm font-semibold text-[#526957]">Tipo de publicación<select className="mt-1.5 w-full rounded-xl border border-[#dce4d8] bg-white px-3.5 py-3 font-normal"><option value="">Elegí una categoría</option>{postTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label className="block text-sm font-semibold text-[#526957]">Título<input maxLength={120} className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3.5 py-3 font-normal" placeholder="Contá brevemente qué necesitás" /></label>
      <label className="block text-sm font-semibold text-[#526957]">Descripción<textarea maxLength={3000} rows={5} className="mt-1.5 w-full resize-y rounded-xl border border-[#dce4d8] px-3.5 py-3 font-normal" placeholder="Agregá los datos importantes para la comunidad" /></label>
      <label className="block text-sm font-semibold text-[#526957]">Localidad<input maxLength={120} className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3.5 py-3 font-normal" /></label>
      <button disabled type="button" className="w-full cursor-not-allowed rounded-xl bg-[#a9b8a3] px-4 py-3 text-sm font-bold text-white">Publicar · en preparación</button>
      <p className="text-xs leading-5 text-[#8a978b]">La publicación se activará cuando exista una cuenta y almacenamiento conectado.</p>
    </form>
  );
}
