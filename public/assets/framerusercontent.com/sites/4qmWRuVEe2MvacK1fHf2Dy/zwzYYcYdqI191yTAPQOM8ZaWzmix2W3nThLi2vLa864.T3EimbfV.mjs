import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";async function t(e,t,i){let a=r[e],o=a?await a(t,i):void 0,s={bodyEnd:[],bodyStart:[],headEnd:[],headStart:[]};for(let t of n){if(t.pageIds&&!t.pageIds.has(e))continue;let n=t.code(o);n&&s[t.placement].push({...t,code:n})}return s}var n,r,i,a;e((()=>{n=[{code:e=>`<script>\r
(function() {\r
  var lastPath = location.pathname;\r
\r
  setInterval(function() {\r
    if (location.pathname !== lastPath) {\r
      lastPath = location.pathname;\r
\r
      // Reset Lenis if it's available globally\r
      if (window.lenis) {\r
        window.lenis.scrollTo(0, { immediate: true });\r
      }\r
    }\r
  }, 50);\r
})();\r
<\/script>`,id:`GjyjFpJoX`,loadMode:`always`,name:`Scroll to Top`,placement:`bodyEnd`}],r={},i={bodyEnd:[`GjyjFpJoX`],bodyStart:[],headEnd:[],headStart:[]},a={exports:{snippetsSorting:{type:`variable`,annotations:{framerContractVersion:`1`}},getSnippets:{type:`function`,annotations:{framerContractVersion:`1`}},__FramerMetadata__:{type:`variable`}}}}))();export{a as __FramerMetadata__,t as getSnippets,i as snippetsSorting};
//# sourceMappingURL=zwzYYcYdqI191yTAPQOM8ZaWzmix2W3nThLi2vLa864.T3EimbfV.mjs.map