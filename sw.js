if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,d)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const r=e=>n(e,o),t={module:{uri:o},exports:c,require:r};i[o]=Promise.all(s.map((e=>t[e]||r(e)))).then((e=>(d(...e),c)))}}define(["./workbox-3625d7b0"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index.4339603b.css",revision:"01e27ef9e85556c4c4e89a23e8ed077c"},{url:"assets/VDownload.03d9d09e.css",revision:"93a73bfaad6beacb2d1ddb69857d187d"},{url:"assets/VDownload.73a54e53.js",revision:"8612dd491030b74fbd376ae7be4ae506"},{url:"index.html",revision:"1d723e5adb7e2ed1eeb6651e75fcbe4e"},{url:"favicon.svg",revision:"520a016d9e7f470c53fac63357e64e1c"},{url:"icons/icon-192x192.png",revision:"15508ba99434da116111915c8ff9de51"},{url:"icons/icon-256x256.png",revision:"c19b111e2c53dd0357e1cb910da3ebb2"},{url:"icons/icon-384x384.png",revision:"123b7d9d954e39448e1ba6efe4b5edad"},{url:"icons/icon-512x512.png",revision:"41eba7568f9eeadd81c5eb1403162705"},{url:"manifest.webmanifest",revision:"c8667b3866b8ead27e4190c05643bdc4"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
//# sourceMappingURL=sw.js.map
