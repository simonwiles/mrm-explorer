import{c as d,d as l,q as c}from"./disclose-version.C3L7z7x-.js";import{a as m,p,t as f}from"./runtime.CsqbjnXD.js";import{u}from"./main-client.B0L5hVVe.js";import{u as g}from"./db.DVEEUmQX.js";import{F as O}from"./storage.CWIlOqU3.js";function v(s,a){m(a,!0);async function n(t){a.imageObject.features=t.features,await f(),g(u(a.imageObject))}var o=c(s),i=l(o);O(i,{labelText:"Add JSON",class:"add-json",$$events:{change:({detail:t})=>{const r=t[0];if(!r.type||!["application/geo+json","application/json"].includes(r.type)){alert("Only JSON / GEOJSON files are accepted");return}const e=new FileReader;e.addEventListener("load",()=>typeof e.result=="string"&&n(JSON.parse(e.result)),!1),e.readAsText(r)}}}),d(s,o),p()}export{v as A};
