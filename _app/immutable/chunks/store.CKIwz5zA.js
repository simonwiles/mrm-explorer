import{n as t,g as l,U as o,u as a,s as c}from"./runtime.uCQMOSHy.js";import{A as b,f,m as _}from"./disclose-version.Cx9vODKj.js";function d(u,e,s){if(u==null)return e(void 0),s&&s(void 0),t;const n=u.subscribe(e,s);return n.unsubscribe?()=>n.unsubscribe():n}function I(u,e,s){let n=s[e];const r=n===void 0;r&&(n={store:null,last_value:null,value:_(o),unsubscribe:t},s[e]=n),(r||n.store!==u)&&(n.unsubscribe(),n.store=u??null,n.unsubscribe=m(u,n.value));const i=l(n.value);return i===o?n.last_value:i}function m(u,e){return u==null?(f(e,void 0),t):d(u,n=>{c(!0),f(e,n),c(!1)})}function y(u){g(()=>{let e;for(e in u)u[e].unsubscribe()})}function g(u){b(()=>()=>a(u))}export{I as s,y as u};
