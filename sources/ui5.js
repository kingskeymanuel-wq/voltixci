/* =========================================================
   INTERFACE v5 — cartes de fiches plus lisibles
   ========================================================= */
function itemHTML(p,sel){const g=p.d==="guide";const dk=g?"guide":p.d;
 return `<button class="item item2 sev-${g?"guide":p.s}" role="option" aria-selected="${sel}" data-id="${p.id}"><span class="i2-ic" style="background:${domGrad(dk)}">${svgI(g?"guides":p.d,2)}</span>
 <span class="i2-b"><span class="i2-id">${p.id}${g?"":" · "+esc(DOM[p.d].n)}</span><span class="i2-t">${esc(p.t)}</span><span class="i2-m">${g?`<span class="pill info">Guide</span>`:`<span class="pill ${p.s}">${SEV[p.s]}</span>`}<span class="i2-x">${LVL[p.lvl]}</span><span class="i2-x">${esc(p.tm)}</span></span></span>
 <svg class="i2-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>`}

(()=>{const nb=document.querySelector('#nav [data-v="rcc"] svg');if(nb)nb.innerHTML=IC.rcc})();
