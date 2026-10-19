document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.querySelector('.menu-btn');
  const nav=document.querySelector('.navlinks');
  if(btn&&nav){
    btn.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      btn.setAttribute('aria-expanded',String(open));
      btn.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');
    });
  }
  // OKS official Instagram link for desktop navigation, mobile menu, and footer.
  const instagramUrl='https://www.instagram.com/o.k.s_reform/';
  const instagramIcon='<svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true" focusable="false"><defs><linearGradient id="oks-ig-gradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffcf54"/><stop offset=".34" stop-color="#ff614a"/><stop offset=".7" stop-color="#d62976"/><stop offset="1" stop-color="#7445d8"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#oks-ig-gradient)"/><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="12" cy="12" r="3.15" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="16.5" cy="7.7" r="1.05" fill="#fff"/></svg>';
  const instagramLink=className=>{
    const link=document.createElement('a');
    link.href=instagramUrl;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.className=className;
    link.setAttribute('aria-label','OKS公式Instagram（新しいタブで開く）');
    link.innerHTML=instagramIcon+'<span>Instagram</span>';
    return link;
  };
  if(nav&&!nav.querySelector('.oks-instagram-nav')){
    const link=instagramLink('oks-instagram-nav');
    const phone=nav.querySelector('.nav-phone');
    if(phone)nav.insertBefore(link,phone);
    else nav.appendChild(link);
  }
  document.querySelectorAll('.footer-v5 .wrap').forEach(footer=>{
    if(footer.querySelector('.oks-instagram-footer'))return;
    const link=instagramLink('oks-instagram-footer');
    const copyright=footer.querySelector('small');
    if(copyright)footer.insertBefore(link,copyright);
    else footer.appendChild(link);
  });
  if(document.querySelector('.oks-instagram-nav,.oks-instagram-footer')){
    const style=document.createElement('style');
    style.textContent=`
      .navlinks>a.oks-instagram-nav{display:inline-flex;align-items:center;gap:7px;color:#264b70;white-space:nowrap}
      .navlinks>a.oks-instagram-nav svg{flex:none;width:25px;height:25px}
      .navlinks>a.oks-instagram-nav span{font-size:.85rem;font-weight:800}
      .navlinks>a.oks-instagram-nav:hover,.oks-instagram-footer:hover{color:#2d79c7}
      .footer-v5 .wrap>a.oks-instagram-footer{display:inline-flex;align-items:center;gap:7px;font-weight:700;color:#42566d}
      .oks-instagram-footer svg{flex:none;width:25px;height:25px}
      @media(min-width:981px) and (max-width:1230px){
        .navlinks>a.oks-instagram-nav span{display:none}
        .navlinks>a.oks-instagram-nav{gap:0}
      }
      @media(max-width:980px){
        .navlinks>a.oks-instagram-nav{padding:8px 0;border:0}
        .navlinks>a.oks-instagram-nav span{font-size:.95rem}
      }
      @media(max-width:620px){
        .footer-v5 .wrap>a.oks-instagram-footer{margin-top:8px}
      }
    `;
    document.head.appendChild(style);
  }
  const chips=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('[data-category]')];
  const empty=document.querySelector('[data-empty-state]');
  if(chips.length&&cards.length){
    chips.forEach(chip=>chip.addEventListener('click',()=>{
      chips.forEach(x=>x.classList.remove('active'));
      chip.classList.add('active');
      const filter=chip.dataset.filter;
      let visible=0;
      cards.forEach(card=>{
        const show=filter==='all'||card.dataset.category.split(' ').includes(filter);
        card.hidden=!show;
        if(show)visible++;
      });
      if(empty)empty.hidden=visible!==0;
    }));
  }
  const typeSelect=document.querySelector('#contact-type');
  if(typeSelect){
    const type=new URLSearchParams(location.search).get('type');
    if(type&&[...typeSelect.options].some(o=>o.value===type)) typeSelect.value=type;
  }
  const form=document.querySelector('[data-demo-form]');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      alert('現在はデザイン確認用です。送信機能は公開前に接続します。');
    });
  }
  const strengthSlider=document.querySelector('[data-strength-slider]');
  if(strengthSlider){
    const slides=[...strengthSlider.querySelectorAll('.strengths-hero-slide')];
    const dots=[...document.querySelectorAll('[data-strength-dot]')];
    let current=0;
    let timer=null;
    const show=index=>{
      current=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>slide.classList.toggle('active',i===current));
      dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));
    };
    const start=()=>{
      if(timer)clearInterval(timer);
      timer=setInterval(()=>show(current+1),5000);
    };
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>{
      show(i);
      start();
    }));
    show(0);
    start();
  }
});
