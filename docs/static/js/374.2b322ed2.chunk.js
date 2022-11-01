/*! For license information please see 374.2b322ed2.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkemit_pins=self.webpackChunkemit_pins||[]).push([[374],{88374:(e,t,n)=>{n.r(t),n.d(t,{startInputShims:()=>v});var o=n(29522),r=n(51684);const i=new WeakMap,a=function(e,t,n){let o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;i.has(e)!==n&&(n?d(e,t,o):l(e,t))},s=e=>e===e.getRootNode().activeElement,d=(e,t,n)=>{const o=t.parentNode,r=t.cloneNode(!1);r.classList.add("cloned-input"),r.tabIndex=-1,o.appendChild(r),i.set(e,r);const a="rtl"===e.ownerDocument.dir?9999:-9999;e.style.pointerEvents="none",t.style.transform=`translate3d(${a}px,${n}px,0) scale(0)`},l=(e,t)=>{const n=i.get(e);n&&(i.delete(e),n.remove()),e.style.pointerEvents="",t.style.transform=""},c="input, textarea, [no-blur], [contenteditable]",u=(e,t,n,o)=>{const r=e.top,i=e.bottom,a=t.top,s=a+15,d=.75*Math.min(t.bottom,o-n)-i,l=s-r,c=Math.round(d<0?-d:l>0?-l:0),u=Math.min(c,r-a),m=Math.abs(u)/.3;return{scrollAmount:u,scrollDuration:Math.min(400,Math.max(150,m)),scrollPadding:n,inputSafeY:4-(r-s)}},m=async(e,t,n,i,s)=>{if(!n&&!i)return;const d=((e,t,n)=>{var o;const r=null!==(o=e.closest("ion-item,[ion-item]"))&&void 0!==o?o:e;return u(r.getBoundingClientRect(),t.getBoundingClientRect(),n,e.ownerDocument.defaultView.innerHeight)})(e,n||i,s);if(n&&Math.abs(d.scrollAmount)<4)t.focus();else if(a(e,t,!0,d.inputSafeY),t.focus(),(0,r.r)((()=>e.click())),"undefined"!==typeof window){let r;const i=async()=>{void 0!==r&&clearTimeout(r),window.removeEventListener("ionKeyboardDidShow",s),window.removeEventListener("ionKeyboardDidShow",i),n&&await(0,o.c)(n,0,d.scrollAmount,d.scrollDuration),a(e,t,!1,d.inputSafeY),t.focus()},s=()=>{window.removeEventListener("ionKeyboardDidShow",s),window.addEventListener("ionKeyboardDidShow",i)};if(n){const e=await(0,o.g)(n),a=e.scrollHeight-e.clientHeight;if(d.scrollAmount>a-e.scrollTop)return"password"===t.type?(d.scrollAmount+=50,window.addEventListener("ionKeyboardDidShow",s)):window.addEventListener("ionKeyboardDidShow",i),void(r=setTimeout(i,1e3))}i()}},p=(e,t,n)=>{if(t&&n){const o=t.x-n.x,r=t.y-n.y;return o*o+r*r>e*e}return!1},f=(e,t)=>{var n,r;if("INPUT"!==e.tagName)return;if(e.parentElement&&"ION-INPUT"===e.parentElement.tagName)return;if("ION-SEARCHBAR"===(null===(r=null===(n=e.parentElement)||void 0===n?void 0:n.parentElement)||void 0===r?void 0:r.tagName))return;const i=(0,o.a)(e);if(null===i)return;const a=i.$ionPaddingTimer;a&&clearTimeout(a),t>0?i.style.setProperty("--keyboard-offset",`${t}px`):i.$ionPaddingTimer=setTimeout((()=>{i.style.setProperty("--keyboard-offset","0px")}),120)},v=e=>{const t=document,n=e.getNumber("keyboardHeight",290),i=e.getBoolean("scrollAssist",!0),d=e.getBoolean("hideCaretOnScroll",!0),l=e.getBoolean("inputBlurring",!0),u=e.getBoolean("scrollPadding",!0),v=Array.from(t.querySelectorAll("ion-input, ion-textarea")),h=new WeakMap,w=new WeakMap,g=async e=>{await new Promise((t=>(0,r.c)(e,t)));const t=e.shadowRoot||e,l=t.querySelector("input")||t.querySelector("textarea"),c=(0,o.a)(e),u=c?null:e.closest("ion-footer");if(!l)return;if(c&&d&&!h.has(e)){const t=((e,t,n)=>{if(!n||!t)return()=>{};const o=n=>{s(t)&&a(e,t,n)},i=()=>a(e,t,!1),d=()=>o(!0),l=()=>o(!1);return(0,r.a)(n,"ionScrollStart",d),(0,r.a)(n,"ionScrollEnd",l),t.addEventListener("blur",i),()=>{(0,r.b)(n,"ionScrollStart",d),(0,r.b)(n,"ionScrollEnd",l),t.addEventListener("ionBlur",i)}})(e,l,c);h.set(e,t)}if(!("date"===l.type||"datetime-local"===l.type)&&(c||u)&&i&&!w.has(e)){const t=((e,t,n,o,i)=>{let a;const d=e=>{a=(0,r.p)(e)},l=d=>{if(!a)return;const l=(0,r.p)(d);p(6,a,l)||s(t)||m(e,t,n,o,i)};return e.addEventListener("touchstart",d,{capture:!0,passive:!0}),e.addEventListener("touchend",l,!0),()=>{e.removeEventListener("touchstart",d,!0),e.removeEventListener("touchend",l,!0)}})(e,l,c,u,n);w.set(e,t)}};l&&(()=>{let e=!0,t=!1;const n=document,o=()=>{t=!0},i=()=>{e=!0},a=o=>{if(t)return void(t=!1);const r=n.activeElement;if(!r)return;if(r.matches(c))return;const i=o.target;i!==r&&(i.matches(c)||i.closest(c)||(e=!1,setTimeout((()=>{e||r.blur()}),50)))};(0,r.a)(n,"ionScrollStart",o),n.addEventListener("focusin",i,!0),n.addEventListener("touchend",a,!1)})(),u&&(e=>{const t=document,n=t=>{f(t.target,e)},o=e=>{f(e.target,0)};t.addEventListener("focusin",n),t.addEventListener("focusout",o)})(n);for(const o of v)g(o);t.addEventListener("ionInputDidLoad",(e=>{g(e.detail)})),t.addEventListener("ionInputDidUnload",(e=>{(e=>{if(d){const t=h.get(e);t&&t(),h.delete(e)}if(i){const t=w.get(e);t&&t(),w.delete(e)}})(e.detail)}))}}}]);