/* Keep the floating Up control out of every case footer, regardless of its page-specific scroll logic. */
(()=>{
 const footer=document.querySelector('.case-footer,[data-node-id="734:4215"],[data-node-id="930:7993"]'),up=document.querySelector('.back-top,.gc-top,.zc-top');if(!footer||!up)return;
 const originallyInert=up.inert,originalAria=up.getAttribute('aria-hidden');
 function showFooter(visible){document.documentElement.classList.toggle('case-footer-in-view',visible);up.inert=visible||originallyInert;if(visible)up.setAttribute('aria-hidden','true');else if(originalAria===null)up.removeAttribute('aria-hidden');else up.setAttribute('aria-hidden',originalAria);}
 const observer=new IntersectionObserver(entries=>showFooter(entries[0].isIntersecting),{threshold:0});observer.observe(footer);
})();
