document.addEventListener('DOMContentLoaded',()=>{
 const btn=document.querySelector('.menu-btn'); const nav=document.querySelector('.navlinks');
 if(btn&&nav) btn.addEventListener('click',()=>nav.classList.toggle('open'));
 const form=document.querySelector('[data-demo-form]');
 if(form) form.addEventListener('submit',e=>{e.preventDefault();alert('デモ版のため送信機能はまだ接続していません。');});
});
