(() => {
// iPadOS can identify itself as macOS; screen size alone must never enable this patch.
const ipad=/iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!ipad)return;
window.portfolioIPad=true;
const root=document.documentElement;root.classList.add('is-ipad');
function viewport(){
 // Layout width must never come from visualViewport: WebKit can retain its portrait value after rotation.
 const width=innerWidth||root.clientWidth,height=innerHeight||root.clientHeight;
 root.style.setProperty('--ipad-width',Math.round(width)+'px');root.style.setProperty('--ipad-height',Math.round(height)+'px');
 root.classList.toggle('ipad-landscape',width>height);
 window.dispatchEvent(new Event('ipadviewport'));
}
let settle,late;function refresh(){viewport();clearTimeout(settle);clearTimeout(late);settle=setTimeout(viewport,350);late=setTimeout(viewport,900);}
viewport();addEventListener('resize',refresh);addEventListener('orientationchange',refresh);addEventListener('pageshow',refresh);window.visualViewport?.addEventListener('resize',refresh);
})();
