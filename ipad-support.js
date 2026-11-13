(() => {
// iPadOS can identify itself as macOS; screen size alone must never enable this patch.
const ipad=/iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!ipad)return;
window.portfolioIPad=true;
const root=document.documentElement;root.classList.add('is-ipad');
function viewport(){
 const view=window.visualViewport,normal=!view||Math.abs(view.scale-1)<.05;
 const width=normal&&view?view.width:innerWidth,height=normal&&view?view.height:innerHeight;
 root.style.setProperty('--ipad-width',Math.round(width)+'px');root.style.setProperty('--ipad-height',Math.round(height)+'px');
 root.classList.toggle('ipad-landscape',width>height);
 window.dispatchEvent(new Event('ipadviewport'));
}
let settle;function refresh(){viewport();clearTimeout(settle);settle=setTimeout(viewport,350);}
viewport();addEventListener('resize',refresh);addEventListener('orientationchange',refresh);addEventListener('pageshow',refresh);window.visualViewport?.addEventListener('resize',refresh);
})();
