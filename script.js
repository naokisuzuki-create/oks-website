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
      chips.forEach(x=>x.classList.remove('active'));chip.classList.add('active');
      const filter=chip.dataset.filter;let visible=0;
      cards.forEach(card=>{const show=filter==='all'||card.dataset.category.split(' ').includes(filter);card.hidden=!show;if(show)visible++;});
      if(empty)empty.hidden=visible!==0;
    }));
  }
});