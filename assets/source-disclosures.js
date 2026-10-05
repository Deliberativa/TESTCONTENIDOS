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
      .definition-disclosure{margin:.7rem .25rem 0}
      .definition-disclosure>summary{position:relative;display:block;padding:.62rem 6.2rem .62rem .8rem;cursor:pointer;list-style:none;background:var(--soft,#f7faf8);border-left:4px solid var(--trend,#007f6b);color:var(--sub,#536963);font-size:.8rem;line-height:1.38}
      .definition-disclosure>summary::-webkit-details-marker{display:none}
      .definition-disclosure-title{display:block;margin-bottom:.12rem;color:var(--ink,#183f37);font-weight:700}
      .definition-disclosure-preview{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3}
      .definition-disclosure-action{position:absolute;right:.7rem;bottom:.58rem;padding:.18rem .48rem;border:1px solid currentColor;border-radius:999px;color:#007f6b;font-size:.68rem;font-weight:700}
      .definition-disclosure-action::after{content:'Expandir'}
      .definition-disclosure[open] .definition-disclosure-action::after{content:'Ocultar'}
      .definition-disclosure[open] .definition-disclosure-preview{display:none}
      .definition-disclosure-body>.definition{margin:0;border-left:4px solid var(--trend,#007f6b);border-top:1px solid var(--border,#d7e2de)}
      .definition-disclosure-body>.definition::before{content:none}
      .definition-disclosure-body>.definition.is-long{column-count:auto}
      .overlay-definition-row>.definition-disclosure{min-width:0;margin:0}
      .map-copy-grid>.definition-disclosure{margin:0;align-self:start}
      .why-disclosure{margin:.65rem 0 0}
      .why-disclosure>summary{position:relative;display:block;padding:.62rem 6.2rem .62rem .8rem;cursor:pointer;list-style:none;background:#f3f7e8;border-left:4px solid var(--norm,#9fae24);color:var(--sub,#536963);font-size:.82rem;line-height:1.4}
      .why-disclosure>summary::-webkit-details-marker{display:none}
      .why-disclosure-title{display:block;margin-bottom:.12rem;color:var(--ink,#183f37);font-weight:700}
      .why-disclosure-preview{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3}
      .why-disclosure-action{position:absolute;right:.7rem;bottom:.58rem;padding:.18rem .48rem;border:1px solid currentColor;border-radius:999px;color:#748514;font-size:.68rem;font-weight:700}
      .why-disclosure-action::after{content:'Expandir'}
      .why-disclosure[open] .why-disclosure-action::after{content:'Ocultar'}
      .why-disclosure[open] .why-disclosure-preview{display:none}
      .why-disclosure-body>.why{margin:0;border-top:1px solid rgba(159,174,36,.28)}
      .why-disclosure-body>.why::before{content:none}
      @media(max-width:620px){.definition-disclosure>summary{padding-right:.8rem;padding-bottom:2.3rem}.definition-disclosure-action{left:.8rem;right:auto}}
      @media(max-width:620px){.why-disclosure>summary{padding-right:.8rem;padding-bottom:2.3rem}.why-disclosure-action{left:.8rem;right:auto}}
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
  const definitionExceedsThreeLines=node=>{
    const clone=node.cloneNode(true),styles=getComputedStyle(node),width=node.getBoundingClientRect().width;
    clone.classList.remove('is-long');Object.assign(clone.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',left:'-99999px',top:'0',width:`${width}px`,height:'auto',maxHeight:'none',columnCount:'1'});document.body.append(clone);
    const lineHeight=parseFloat(getComputedStyle(clone).lineHeight)||parseFloat(styles.fontSize)*1.38,verticalPadding=parseFloat(styles.paddingTop)+parseFloat(styles.paddingBottom),contentHeight=clone.scrollHeight-verticalPadding;clone.remove();return contentHeight>lineHeight*3+.5;
  };
  const wrapDefinition=node=>{
    if(!node||node.closest('.definition-disclosure')||!definitionExceedsThreeLines(node))return;
    const details=document.createElement('details'),summary=document.createElement('summary'),title=document.createElement('span'),preview=document.createElement('span'),action=document.createElement('span'),body=document.createElement('div');
    details.className='definition-disclosure';title.className='definition-disclosure-title';preview.className='definition-disclosure-preview';action.className='definition-disclosure-action';body.className='definition-disclosure-body';
    title.textContent='Qué mide';preview.textContent=node.textContent.replace(/\s+/g,' ').trim();action.setAttribute('aria-hidden','true');summary.append(title,preview,action);node.before(details);body.append(node);details.append(summary,body);
  };
  const wrapWhy=node=>{
    if(!node||node.closest('.why-disclosure')||!definitionExceedsThreeLines(node))return;
    const details=document.createElement('details'),summary=document.createElement('summary'),title=document.createElement('span'),preview=document.createElement('span'),action=document.createElement('span'),body=document.createElement('div');
    details.className='why-disclosure';title.className='why-disclosure-title';preview.className='why-disclosure-preview';action.className='why-disclosure-action';body.className='why-disclosure-body';
    title.textContent='¿Por qué cambia de un escenario a otro?';preview.textContent=node.textContent.replace(/\s+/g,' ').trim();action.setAttribute('aria-hidden','true');summary.append(title,preview,action);node.before(details);body.append(node);details.append(summary,body);
  };
  const splitChartNote=node=>{
    if(!node||node.dataset.sourcesSplit==='true')return;
    const match=node.innerHTML.match(/\s*(Fuentes?|Referencias?)\s*:\s*([\s\S]+)$/i);if(!match)return;
    const source=document.createElement('p');source.className='source';source.innerHTML=`<strong>${match[1]}:</strong> ${match[2]}`;node.innerHTML=node.innerHTML.slice(0,match.index).trim();node.dataset.sourcesSplit='true';node.after(source);wrapSource(source);if(!node.textContent.trim())node.hidden=true;
  };
  const init=()=>{injectStyles();document.querySelectorAll('details.compare-row p.definition').forEach(wrapDefinition);document.querySelectorAll('details.compare-row p.why').forEach(wrapWhy);document.querySelectorAll('details.compare-row p.method').forEach(wrapMethod);document.querySelectorAll('details.compare-row>p.source').forEach(wrapSource);document.querySelectorAll('.chapter .chart-note').forEach(splitChartNote)};
  queueMicrotask(init);
})();
