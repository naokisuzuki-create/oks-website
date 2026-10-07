const OKS_PROPERTY_ENDPOINT='https://script.google.com/macros/s/AKfycbySA2DcBs2AMl5FMl4N8zjd7JWcP4IxlMcUxM3ve03A-i3zgFaNnoYljDvm5PSto_Krsw/exec';
const OKS_PROPERTY_CACHE_KEY='oks-properties-v2';

function oksEsc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function oksTruthy(v){return v===true||['TRUE','1'].includes(String(v||'').trim().toUpperCase());}
function oksDriveFallback(url=''){const m=String(url).match(/[?&]id=([^&]+)/);return m?'https://lh3.googleusercontent.com/d/'+m[1]:'';}
function oksRetryImage(img){const f=img.dataset.fallbackSrc;if(f&&img.src!==f){img.onerror=null;img.src=f;}}
function oksImg(url,alt,lazy=true){
  const src=String(url||'').trim();
  if(!src)return '<div class="oks-property-placeholder">NO IMAGE</div>';
  const fallback=oksDriveFallback(src);
  return '<img src="'+oksEsc(src)+'" alt="'+oksEsc(alt||'')+'"'+(lazy?' loading="lazy"':'')+' referrerpolicy="no-referrer"'+(fallback?' data-fallback-src="'+oksEsc(fallback)+'" onerror="oksRetryImage(this)"':'')+'>';
}
function oksReadCache(){try{const raw=localStorage.getItem(OKS_PROPERTY_CACHE_KEY);if(!raw)return null;const d=JSON.parse(raw);return Array.isArray(d?.properties)?d.properties:null;}catch(e){return null;}}
function oksWriteCache(items){try{localStorage.setItem(OKS_PROPERTY_CACHE_KEY,JSON.stringify({savedAt:Date.now(),properties:items}));}catch(e){}}
async function oksFetchProperties(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const r=await fetch(OKS_PROPERTY_ENDPOINT,{cache:'default',signal:controller.signal});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();
    if(!Array.isArray(d?.properties))throw new Error('Unexpected response format');
    return d.properties;
  }finally{clearTimeout(timer);}
}
function oksPropertyCard(p){
  const station=[p.station,p.walk].filter(Boolean).join(' ');
  const meta=[
    p.address?'📍 '+p.address:'',
    station?'🚉 '+station:'',
    p.layout?'▣ '+p.layout:'',
    (p.land_area||p.building_area)?'⌂ 土地 '+(p.land_area||'-')+'　建物 '+(p.building_area||'-'):'',
    p.year?'▤ '+p.year:''
  ].filter(Boolean).join('<br>');
  return '<article class="oks-property-card"><a class="oks-property-link" href="property.html?id='+encodeURIComponent(String(p.id||''))+'">'+
    '<div class="oks-property-image">'+oksImg(p.image_url,p.title,true)+'</div>'+
    '<div class="oks-property-body"><div class="oks-property-top"><span class="oks-property-badge">'+oksEsc(p.status||'物件情報')+'</span><span class="oks-property-price">'+oksEsc(p.price||'価格未定')+'</span></div>'+
    '<h3>'+oksEsc(p.title||'物件名未設定')+'</h3><p class="oks-property-meta">'+meta+'</p><p class="oks-property-description">'+oksEsc(p.description||'')+'</p><span class="oks-property-detail-link">詳しく見る →</span></div></a></article>';
}
function oksRenderGrids(items){
  document.querySelectorAll('[data-property-grid]').forEach(grid=>{
    const status=grid.parentElement?.querySelector('[data-property-status]');
    let list=items.filter(x=>oksTruthy(x.published));
    if(grid.dataset.featured==='true')list=list.filter(x=>oksTruthy(x.featured));
    const limit=Number(grid.dataset.limit||0);
    if(limit>0)list=list.slice(0,limit);
    if(!list.length){grid.innerHTML='';if(status)status.textContent='現在公開中の物件はありません。';return;}
    if(status)status.textContent='';
    grid.innerHTML=list.map(oksPropertyCard).join('');
  });
}
function oksSpec(label,value){return '<div><dt>'+oksEsc(label)+'</dt><dd>'+oksEsc(value||'-')+'</dd></div>';}
function oksRenderDetail(items){
  const root=document.querySelector('[data-property-detail]');
  if(!root)return;
  const id=String(new URLSearchParams(location.search).get('id')||'').trim();
  const p=items.find(x=>String(x.id||'').trim()===id&&oksTruthy(x.published));
  if(!p){root.innerHTML='<div class="oks-property-not-found"><h1>物件が見つかりません</h1><p>公開終了、またはURLが変更された可能性があります。</p><a class="btn primary" href="properties.html">物件一覧へ戻る</a></div>';return;}
  document.title=(p.title||'物件詳細')+'｜株式会社オーケーエス';
  const images=Array.isArray(p.images)?p.images:[];
  const main=images[0];
  const gallery=images.length?'<div class="oks-gallery"><div class="oks-gallery-main">'+oksImg(main.image_url,main.file_name||p.title,false).replace('<img ','<img data-oks-main ')+'</div><div class="oks-gallery-thumbs">'+images.map((img,i)=>'<button type="button" class="oks-gallery-thumb'+(i===0?' active':'')+'" data-oks-thumb="'+i+'">'+oksImg(img.image_url,img.file_name||p.title,true)+(img.image_type==='floorplan'?'<span>間取り</span>':'')+'</button>').join('')+'</div></div>':'<div class="oks-property-placeholder oks-property-detail-placeholder">NO IMAGE</div>';
  root.innerHTML='<div class="oks-property-detail-head"><div class="oks-property-detail-image">'+gallery+'</div><div class="oks-property-detail-summary"><span class="oks-property-badge">'+oksEsc(p.status||'物件情報')+'</span><p class="section-kicker">PROPERTY</p><h1>'+oksEsc(p.title||'')+'</h1><p class="oks-detail-price">'+oksEsc(p.price||'価格未定')+'</p><p>'+oksEsc(p.description||'')+'</p><a class="btn primary" href="contact.html?type=不動産">この物件について相談する</a></div></div>'+
    '<dl class="oks-property-specs">'+
    oksSpec('所在地',p.address)+oksSpec('交通',[p.station,p.walk].filter(Boolean).join(' '))+oksSpec('間取り',p.layout)+oksSpec('土地面積',p.land_area)+oksSpec('建物面積',p.building_area)+oksSpec('築年月',p.year)+oksSpec('構造',p.structure)+oksSpec('土地権利',p.land_right)+oksSpec('用途地域',p.zoning)+oksSpec('建ぺい率',p.building_coverage)+oksSpec('容積率',p.floor_area_ratio)+oksSpec('接道',p.road)+oksSpec('駐車場',p.parking)+oksSpec('引渡し',p.handover)+oksSpec('取引態様',p.transaction_type)+'</dl>'+
    (p.detail?'<section class="oks-property-detail-copy"><p class="section-kicker">DETAIL</p><h2>この物件について</h2><p>'+oksEsc(p.detail)+'</p></section>':'')+
    '<section class="oks-property-reform"><p class="section-kicker">REFORM × REAL ESTATE</p><h2>購入後のリフォームも、OKSへまとめてご相談ください。</h2><p>水回り、内装、外壁・屋根、修繕など、物件購入とあわせて住まいづくりをご相談いただけます。</p><a class="btn primary" href="contact.html?type=不動産">リフォームも含めて相談する</a></section>';
  const mainImg=root.querySelector('[data-oks-main]');
  const thumbs=[...root.querySelectorAll('[data-oks-thumb]')];
  thumbs.forEach(btn=>btn.addEventListener('click',()=>{
    const img=images[Number(btn.dataset.oksThumb||0)];
    if(!img||!mainImg)return;
    mainImg.src=img.image_url;
    mainImg.alt=img.file_name||p.title;
    mainImg.dataset.fallbackSrc=oksDriveFallback(img.image_url);
    mainImg.onerror=()=>oksRetryImage(mainImg);
    thumbs.forEach((t,i)=>t.classList.toggle('active',i===Number(btn.dataset.oksThumb||0)));
  }));
}
function oksRenderAll(items){oksRenderGrids(items);oksRenderDetail(items);}
async function oksInitProperties(){
  if(!document.querySelector('[data-property-grid],[data-property-detail]'))return;
  const cached=oksReadCache();
  if(cached?.length)oksRenderAll(cached);
  try{const items=await oksFetchProperties();oksWriteCache(items);oksRenderAll(items);}
  catch(err){console.warn('Property feed failed.',err);if(!cached?.length)document.querySelectorAll('[data-property-status]').forEach(el=>el.textContent='物件情報を取得できませんでした。時間をおいて再度お試しください。');}
}
document.addEventListener('DOMContentLoaded',oksInitProperties);
