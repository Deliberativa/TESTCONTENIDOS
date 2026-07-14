(()=>{
  const injectStyles=()=>{
    if(document.getElementById('source-disclosure-styles'))return;
    const style=document.createElement('style');style.id='source-disclosure-styles';style.textContent=`
      .source-disclosure{margin:.85rem 0 0;border-top:1px solid var(--border,#d7e2de)}
      .source-disclosure>summary{display:flex;min-width:0;align-items:center;gap:.55rem;padding:.55rem 0;cursor:pointer;list-style:none;color:var(--sub,#536963);font-size:.75rem;font-weight:700;white-space:nowrap}
      .source-disclosure>summary::-webkit-details-marker{display:none}
      .source-disclosure-title{flex:0 0 auto;color:var(--ink,#183f37)}
      .source-disclosure-preview{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;font-weight:400}
      .source-disclosure-action{flex:0 0 auto;padding:.18rem .48rem;border:1px solid currentColor;border-radius:999px;color:#007f6b;font-size:.68rem}
      .source-disclosure-action::after{content:'Expandir'}
      .source-disclosure[open] .source-disclosure-action::after{content:'Ocultar'}
      .source-disclosure[open] .source-disclosure-preview{display:none}
      .source-disclosure-body{padding:.15rem 0 .7rem}
      .source-disclosure-body>.source,.source-disclosure-body>.method{margin:0;white-space:normal}
      .method-disclosure .method::before{content:none}
      .method-disclosure+.source-disclosure{margin-top:.425rem}
      details.compare-row:has(>.source-disclosure:last-child){padding-bottom:.425rem}
      .map-copy-grid>.method-disclosure{margin:0;padding:.62rem .8rem;background:var(--soft,#f7faf8);border-top:0;border-left:4px solid var(--norm,#9fae24);align-self:start}
      .map-copy-grid>.method-disclosure .source-disclosure-body{padding-bottom:0}
    `;document.head.append(style);
  };
  const previewText=node=>node.textContent.replace(/^\s*(Fuentes?|Referencias?)\s*:\s*/i,'').replace(/\s+/g,' ').trim().slice(0,180);
  const wrapSource=node=>{
    if(!node||node.closest('.source-disclosure'))return;
    const details=document.createElement('details'),summary=document.createElement('summary'),title=document.createElement('span'),preview=document.createElement('span'),action=document.createElement('span'),body=document.createElement('div');
    details.className='source-disclosure';title.className='source-disclosure-title';preview.className='source-disclosure-preview';action.className='source-disclosure-action';body.className='source-disclosure-body';
    title.textContent='Fuentes y referencias';preview.textContent=previewText(node);action.setAttribute('aria-hidden','true');summary.append(title,preview,action);node.before(details);body.append(node);details.append(summary,body);
  };
  const wrapMethod=node=>{
    if(!node||node.closest('.method-disclosure'))return;
    const details=document.createElement('details'),summary=document.createElement('summary'),title=document.createElement('span'),preview=document.createElement('span'),action=document.createElement('span'),body=document.createElement('div');
    details.className='source-disclosure method-disclosure';title.className='source-disclosure-title';preview.className='source-disclosure-preview';action.className='source-disclosure-action';body.className='source-disclosure-body';
    title.textContent='Método';preview.textContent=node.textContent.replace(/\s+/g,' ').trim().slice(0,180);action.setAttribute('aria-hidden','true');summary.append(title,preview,action);node.before(details);body.append(node);details.append(summary,body);
  };
  const splitChartNote=node=>{
    if(!node||node.dataset.sourcesSplit==='true')return;
    const match=node.innerHTML.match(/\s*(Fuentes?|Referencias?)\s*:\s*([\s\S]+)$/i);if(!match)return;
    const source=document.createElement('p');source.className='source';source.innerHTML=`<strong>${match[1]}:</strong> ${match[2]}`;node.innerHTML=node.innerHTML.slice(0,match.index).trim();node.dataset.sourcesSplit='true';node.after(source);wrapSource(source);if(!node.textContent.trim())node.hidden=true;
  };
  const init=()=>{injectStyles();document.querySelectorAll('details.compare-row p.method').forEach(wrapMethod);document.querySelectorAll('details.compare-row>p.source').forEach(wrapSource);document.querySelectorAll('.chapter .chart-note').forEach(splitChartNote)};
  if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();
