export function RoleSelector() {
  return <fieldset className="rounded-xl border border-[#dce4d8] p-3"><legend className="px-1 text-sm font-semibold text-[#526957]">Tipo de cuenta</legend><label className="flex items-center gap-2 py-1 text-sm text-[#718075]"><input type="radio" name="accountType" value="person" defaultChecked /> Persona</label><label className="flex items-center gap-2 py-1 text-sm text-[#718075]"><input type="radio" name="accountType" value="rescue_organization" /> Refugio u organización</label></fieldset>;
}
