// Read-only guidance derived from the existing world. Nothing new is saved.
export function directionTo(player, target) {
  const dx=target.x-player.x,dy=target.y-player.y;
  if(Math.hypot(dx,dy)<105)return 'In Gesprächsreichweite · E oder Reden';
  const horizontal=Math.abs(dx)<45?'':dx<0?'westen':'osten';
  const vertical=Math.abs(dy)<45?'':dy<0?'Nord':'Süd';
  return vertical?(vertical+horizontal):(horizontal==='westen'?'Westen':'Osten');
}

export function navigationStatus(state, targetId) {
  const target=state.npcs.find(n=>n.id===targetId)||state.npcs[0];
  const completed=state.boundaryPeople;
  const remaining=state.npcs.filter(n=>!completed.includes(n.id));
  return {
    target,
    direction:target.trust<=-3?'Gesprächsweg nach Schubsereien gesperrt':directionTo(state.player,target),
    boundaries:Math.min(state.boundaries,3),
    remaining:remaining.map(n=>n.name+(n.trust<=-3?' (verweigert Gespräche)':'')),
    kiosk:state.closed?'Kiosk geschlossen · Diese Folge bleibt bestehen.':`Kiosk offen · Chaos ${state.chaos}/100. Ab 50 schließt er.`,
    fine:state.fineIssued?'Unruhepauschale bereits kassiert · 12 € waren fällig.':`Noch keine Unruhepauschale · Misstrauen ${state.suspicion}/100. Ab 60 werden 12 € fällig.`,
  };
}
