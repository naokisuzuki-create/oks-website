const OKS_PROPERTY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbySA2DcBs2AMl5FMl4N8zjd7JWcP4IxlMcUxM3ve03A-i3zgFaNnoYljDvm5PSto_Krsw/exec';
const OKS_PROPERTY_CACHE_KEY = 'oks-properties-v1';

function oksEsc(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function oksTruthy(value){
  return value===true||['TRUE','1'].includes(String(value||'').trim().toUpperCase());
}

function oksDriveFallback(url=''){
  const match=String(url).match(/[?&]id=([^&]+)/);
  return match?'https://lh3.googleusercontent.com/d/'+match[1]:'';
}

function oksRetryImage(img){
  const fallback=img.dataset.fallbackSrc;
  if(fallback&&img.src!==fallback){img.onerror=null;img.src=fallback;}
}

function oksImage(url,alt,lazy=true){
  const src=String(url||'').trim();
  if(!src)return '<div class="property-live-placeholder">NO IMAGE</div>';
  const fallback=oksDriveFallback(src);
  return '<img src="'+oksEsc(src)+'" alt="'+oksEsc(alt||'')+'"'+(lazy?' loading="lazy"':'')+' referrerpolicy="no-referrer"'+(fallback?' data-fallback-src="'+oksEsc(fallback)+'" onerror="oksRetryImage(this)"':'')+'>';
}

function oksReadCache(){
  try{const raw=localStorage.getItem(OKS_PROPERTY_CACHE_KEY);if(!raw)return null;const parsed=JSON.parse(raw);return Array.isArray(parsed&&parsed.properties)?parsed.properties:null;}catch(e){return null;}
}

function oksWriteCache(properties){
  try{localStorage.setItem(OKS_PROPERTY_CACHE_KEY,JSON.stringify({savedAt:Date.now(),properties:properties}));}catch(e){}
}

async function oksFetchProperties(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(OKS_PROPERTY_ENDPOINT,{cache:'default',signal:controller.signal});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json();
    if(!data||!Array.isArray(data.properties))throw new Error('Unexpected response format');
    return data.properties;
  }finally{clearTimeout(timer);}
}

function oksPropertyCard(p){
  const station=[p.station,p.walk].filter(Boolean).join(' ');
  return '<a class="property-live-card" href="property.html?id='+encodeURIComponent(String(p.id||''))+'">'+
    '<div class="property-live-photo">'+oksImage(p.image_url,p.title,true)+'<span>'+oksEsc(p.status||'物件情報')+'</span></div>'+
    '<div class="property-live-body"><p class="property-live-type">'+oksEsc(p.property_type||'')+'</p><h3>'+oksEsc(p.title||'物件名未設定')+'</h3><strong>'+oksEsc(p.price||'価格未定')+'</strong>'+
    '<dl><div><dt>所在地</dt><dd>'+oksEsc(p.address||'-')+'</dd></div><div><dt>交通</dt><dd>'+oksEsc(station||'-')+'</dd></div><div><dt>間取り</dt><dd>'+oksEsc(p.layout||'-')+'</dd></div></dl>'+
    '<p class="property-live-description">'+oksEsc(p.description||'')+'</p><b>詳しく見る <i>→</i></b></div></a>';
}

function oksRenderGrids(properties){
  document.querySelectorAll('[data-property-grid]').forEach(grid=>{
    const status=grid.parentElement&&grid.parentElement.querySelector('[data-property-status]');
    let list=properties.filter(p=>oksTruthy(p.published));
    if(grid.dataset.featured==='true')list=list.filter(p=>oksTruthy(p.featured));
    const limit=Number(grid.dataset.limit||0);if(limit>0)list=list.slice(0,limit);
    if(!list.length){grid.innerHTML='';if(status)status.textContent='現在公開中の物件はありません。';return;}
    if(status)status.textContent='';grid.innerHTML=list.map(oksPropertyCard).join('');
  });
}

function oksSpec(label,value){return '<div><dt>'+oksEsc(label)+'</dt><dd>'+oksEsc(value||'-')+'</dd></div>';}

function oksRenderDetail(properties){
  const root=document.querySelector('[data-property-detail]');if(!root)return;
  const id=String(new URLSearchParams(location.search).get('id')||'').trim();
  const p=properties.find(x=>String(x.id||'').trim()===id&&oksTruthy(x.published));
  if(!p){root.innerHTML='<div class="property-not-found"><h1>物件が見つかりません</h1><p>公開終了、またはURLが変更された可能性があります。</p><a class="btn primary" href="properties.html">物件一覧へ戻る</a></div>';return;}
  document.title=(p.title||'物件詳細')+'｜株式会社オーケーエス';
  const images=Array.isArray(p.images)?p.images:[];
  let gallery='<div class="property-detail-placeholder">NO IMAGE</div>';
  if(images.length){
    const thumbs=images.map((img,i)=>'<button type="button" class="property-thumb'+(i===0?' active':'')+'" data-property-thumb="'+i+'">'+oksImage(img.image_url,img.file_name||p.title,true)+(img.image_type==='floorplan'?'<span>間取り</span>':'')+'</button>').join('');
    gallery='<div class="property-gallery"><div class="property-main-image">'+oksImage(images[0].image_url,images[0].file_name||p.title,false).replace('<img ','<img data-property-main ')+'</div>'+(images.length>1?'<div class="property-thumbs">'+thumbs+'</div>':'')+'</div>';
  }
  root.innerHTML='<div class="property-detail-head"><div>'+gallery+'</div><div class="property-detail-summary"><span class="property-detail-badge">'+oksEsc(p.status||'物件情報')+'</span><p class="section-kicker">PROPERTY</p><h1>'+oksEsc(p.title||'')+'</h1><p class="property-detail-price">'+oksEsc(p.price||'価格未定')+'</p><p>'+oksEsc(p.description||'')+'</p><a class="btn primary" href="contact.html?type=不動産">この物件について相談する</a></div></div>'+
    '<dl class="property-specs">'+oksSpec('所在地',p.address)+oksSpec('交通',[p.station,p.walk].filter(Boolean).join(' '))+oksSpec('間取り',p.layout)+oksSpec('土地面積',p.land_area)+oksSpec('建物面積',p.building_area)+oksSpec('築年月',p.year)+oksSpec('構造',p.structure)+oksSpec('土地権利',p.land_right)+oksSpec('用途地域',p.zoning)+oksSpec('建ぺい率',p.building_coverage)+oksSpec('容積率',p.floor_area_ratio)+oksSpec('接道',p.road)+oksSpec('駐車場',p.parking)+oksSpec('引渡し',p.handover)+oksSpec('取引態様',p.transaction_type)+'</dl>'+
    (p.detail?'<section class="property-detail-copy"><p class="section-kicker">DETAIL</p><h2>物件について</h2><p>'+oksEsc(p.detail)+'</p></section>':'')+
    '<section class="property-reform-box"><p class="section-kicker">REFORM × REAL ESTATE</p><h2>購入後のリフォームも、OKSへまとめてご相談ください。</h2><p>水回り、内装、外壁・屋根、修繕など、物件購入とあわせて住まいづくりをご相談いただけます。</p><a class="btn primary" href="contact.html?type=不動産">リフォームも含めて相談する</a></section>';
  const main=root.querySelector('[data-property-main]');const thumbs=[...root.querySelectorAll('[data-property-thumb]')];
  thumbs.forEach(btn=>btn.addEventListener('click',()=>{const index=Number(btn.dataset.propertyThumb||0);const img=images[index];if(!img||!main)return;main.src=img.image_url;main.alt=img.file_name||p.title;main.dataset.fallbackSrc=oksDriveFallback(img.image_url);main.onerror=()=>oksRetryImage(main);thumbs.forEach((t,i)=>t.classList.toggle('active',i===index));}));
}

function oksRenderAll(properties){oksRenderGrids(properties);oksRenderDetail(properties);}

async function oksInitProperties(){
  if(!document.querySelector('[data-property-grid],[data-property-detail]'))return;
  const cached=oksReadCache();if(cached&&cached.length)oksRenderAll(cached);
  try{const properties=await oksFetchProperties();oksWriteCache(properties);oksRenderAll(properties);}catch(err){console.warn('Property feed failed.',err);if(!cached||!cached.length){document.querySelectorAll('[data-property-status]').forEach(el=>el.textContent='物件情報を取得できませんでした。時間をおいて再度お試しください。');}}
}

document.addEventListener('DOMContentLoaded',oksInitProperties);