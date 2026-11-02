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
  // Show the privacy policy in the shared footer on every page.
  document.querySelectorAll('.footer-v5 .wrap').forEach(footer=>{
    if(footer.querySelector('.oks-privacy-footer'))return;
    const privacy=document.createElement('a');
    privacy.className='oks-privacy-footer';
    privacy.href='privacy.html';
    privacy.textContent='プライバシーポリシー';
    const copyright=footer.querySelector('small');
    if(copyright)footer.insertBefore(privacy,copyright);
    else footer.appendChild(privacy);
  });
  if(document.querySelector('.oks-privacy-footer')){
    const style=document.createElement('style');
    style.textContent=`
      .footer-v5 .wrap>a.oks-privacy-footer{font-weight:700;color:#42566d;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
      .footer-v5 .wrap>a.oks-privacy-footer:hover{color:#2d79c7}
      @media(max-width:620px){.footer-v5 .wrap>a.oks-privacy-footer{display:inline-block;margin-top:8px;margin-right:16px}}
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

  const form=document.querySelector('[data-oks-contact-form]');
  const review=document.querySelector('[data-oks-contact-review]');
  const resultPanel=document.querySelector('[data-oks-contact-result]');
  const transport=document.querySelector('iframe[name="oks-contact-transport"]');

  if(form&&review){
    const useInlineResult=form.dataset.oksInlineResult==='true';
    const requestField=form.elements.namedItem('oks_request_id');
    let pendingRequestId='';
    let responseTimer=null;

    const showContactResult=(success,message,receiptId='',unknown=false)=>{
      if(responseTimer!==null){
        clearTimeout(responseTimer);
        responseTimer=null;
      }
      pendingRequestId='';
      const title=resultPanel.querySelector('[data-oks-result-title]');
      const body=resultPanel.querySelector('[data-oks-result-message]');
      const receipt=resultPanel.querySelector('[data-oks-result-receipt]');
      const back=resultPanel.querySelector('[data-oks-result-back]');
      title.textContent=unknown?'送信結果を確認できませんでした':success?'お問い合わせを受け付けました':'お問い合わせを受け付けられませんでした';
      body.textContent=message;
      const validReceipt=success&&/^OKS-[0-9]{8}-[0-9]{6}-[a-z0-9]{8}$/i.test(receiptId);
      receipt.hidden=!validReceipt;
      receipt.textContent=validReceipt?'受付番号：'+receiptId:'';
      back.href=success?'index.html':unknown?'tel:0728965220':'contact.html';
      back.textContent=success?'OKSホームページへ戻る':unknown?'電話で確認する':'お問い合わせフォームへ戻る';
      form.hidden=true;
      review.hidden=true;
      resultPanel.hidden=false;
      resultPanel.focus();
    };

    if(useInlineResult){
      window.addEventListener('message',event=>{
        if(!pendingRequestId||!event.data||typeof event.data!=='object')return;
        const fromGAS=event.origin==='https://script.google.com'||
          /^https:\/\/(?:[a-z0-9-]+\.)*googleusercontent\.com$/.test(event.origin);
        if(!fromGAS||event.data.type!=='oks-contact-result-v1'||
           event.data.requestId!==pendingRequestId)return;
        const success=event.data.success===true;
        const message=typeof event.data.message==='string'?event.data.message:'受付結果を確認してください。';
        const receiptId=typeof event.data.receiptId==='string'?event.data.receiptId:'';
        showContactResult(success,message,receiptId);
      });
    }
    const tel=form.elements.namedItem('tel');
    const email=form.elements.namedItem('email');
    const send=review.querySelector('[data-oks-contact-send]');
    const edit=review.querySelector('[data-oks-contact-edit]');
    const started=form.elements.namedItem('form_started');

    if(started)started.value=String(Date.now());

    const clearContactError=()=>{
      email.setCustomValidity('');
    };

    tel.addEventListener('input',clearContactError);
    email.addEventListener('input',clearContactError);

    form.addEventListener('submit',e=>{
      e.preventDefault();
      clearContactError();

      if(!tel.value.trim()&&!email.value.trim()){
        email.setCustomValidity('電話番号またはメールアドレスを入力してください。');
      }

      if(!form.reportValidity())return;

      const turnstileToken=form.querySelector('[name="cf-turnstile-response"]');
      if(!turnstileToken||!turnstileToken.value){
        alert('ロボット認証が完了していません。認証を確認してください。');
        return;
      }

      const data=new FormData(form);
      const values={
        type:form.elements.namedItem('type').selectedOptions[0].textContent,
        name:data.get('name')||'',
        tel:data.get('tel')||'未入力',
        email:data.get('email')||'未入力',
        message:data.get('message')||''
      };

      Object.entries(values).forEach(([key,value])=>{
        const target=review.querySelector('[data-oks-review-'+key+']');
        if(target)target.textContent=String(value);
      });

      form.hidden=true;
      review.hidden=false;
      review.focus();
    });

    edit.addEventListener('click',()=>{
      review.hidden=true;
      form.hidden=false;
      form.elements.namedItem('name').focus();
    });

    send.addEventListener('click',()=>{
      if(send.disabled)return;

      const turnstileToken=form.querySelector('[name="cf-turnstile-response"]');
      if(!turnstileToken||!turnstileToken.value){
        review.hidden=true;
        form.hidden=false;
        alert('ロボット認証の有効期限が切れました。再度認証してください。');
        return;
      }

      send.disabled=true;
      send.textContent='送信中…';

      if(!useInlineResult){
        form.submit();
        return;
      }

      if(!transport||!requestField||!resultPanel||!self.crypto||!self.crypto.randomUUID){
        send.disabled=false;
        send.textContent='この内容で送信する';
        alert('送信画面を準備できませんでした。再読み込みしてお試しください。');
        return;
      }

      pendingRequestId=self.crypto.randomUUID().replace(/-/g,'');
      requestField.value=pendingRequestId;
      form.target='oks-contact-transport';
      form.submit();

      responseTimer=setTimeout(()=>{
        showContactResult(false,'受付が完了した可能性があります。重複を避けるため再送信せず、電話で受付状況をご確認ください。','',true);
      },90000);
    });

    window.addEventListener('pageshow',()=>{
      send.disabled=false;
      send.textContent='この内容で送信する';
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
