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
