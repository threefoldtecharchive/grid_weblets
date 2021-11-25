!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function s(t){t.forEach(e)}function o(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(e,n,s){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const s=e.subscribe(...n);return s.unsubscribe?()=>s.unsubscribe():s}(n,s))}function l(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function p(){return d(" ")}function f(){return d("")}function m(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function h(t){return function(e){return e.preventDefault(),t.call(this,e)}}function g(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function $(t){return""===t?null:+t}function b(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function y(t,e){t.value=null==e?"":e}function v(t,e,n,s){t.style.setProperty(e,n,s?"important":"")}function w(t,e){for(let n=0;n<t.options.length;n+=1){const s=t.options[n];if(s.__value===e)return void(s.selected=!0)}t.selectedIndex=-1}function _(t){const e={};for(const n of t)e[n.name]=n.value;return e}let x;function E(t){x=t}function k(){if(!x)throw new Error("Function called outside component initialization");return x}function S(){const t=k();return(e,n)=>{const s=t.$$.callbacks[e];if(s){const o=function(t,e,n=!1){const s=document.createEvent("CustomEvent");return s.initCustomEvent(t,n,!1,e),s}(e,n);s.slice().forEach((e=>{e.call(t,o)}))}}}function N(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const A=[],P=[],R=[],C=[],M=Promise.resolve();let D=!1;function T(t){R.push(t)}function O(t){C.push(t)}let I=!1;const B=new Set;function j(){if(!I){I=!0;do{for(let t=0;t<A.length;t+=1){const e=A[t];E(e),U(e.$$)}for(E(null),A.length=0;P.length;)P.pop()();for(let t=0;t<R.length;t+=1){const e=R[t];B.has(e)||(B.add(e),e())}R.length=0}while(A.length);for(;C.length;)C.pop()();D=!1,I=!1,B.clear()}}function U(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(T)}}const z=new Set;let L,F;function H(){L={r:0,c:[],p:L}}function V(){L.r||s(L.c),L=L.p}function q(t,e){t&&t.i&&(z.delete(t),t.i(e))}function G(t,e,n,s){if(t&&t.o){if(z.has(t))return;z.add(t),L.c.push((()=>{z.delete(t),s&&(n&&t.d(1),s())})),t.o(e)}}function W(t,e){t.d(1),e.delete(t.key)}function J(t,e){G(t,1,1,(()=>{e.delete(t.key)}))}function K(t,e,n,s,o,i,r,l,a,c,u,d){let p=t.length,f=i.length,m=p;const h={};for(;m--;)h[t[m].key]=m;const g=[],$=new Map,b=new Map;for(m=f;m--;){const t=d(o,i,m),l=n(t);let a=r.get(l);a?s&&a.p(t,e):(a=c(l,t),a.c()),$.set(l,g[m]=a),l in h&&b.set(l,Math.abs(m-h[l]))}const y=new Set,v=new Set;function w(t){q(t,1),t.m(l,u),r.set(t.key,t),u=t.first,f--}for(;p&&f;){const e=g[f-1],n=t[p-1],s=e.key,o=n.key;e===n?(u=e.first,p--,f--):$.has(o)?!r.has(s)||y.has(s)?w(e):v.has(o)?p--:b.get(s)>b.get(o)?(v.add(s),w(e)):(y.add(o),p--):(a(n,r),p--)}for(;p--;){const e=t[p];$.has(e.key)||a(e,r)}for(;f;)w(g[f-1]);return g}function Y(t,e,n){const s=t.$$.props[e];void 0!==s&&(t.$$.bound[s]=n,n(t.$$.ctx[s]))}function X(t){t&&t.c()}function Q(t,n,i,r){const{fragment:l,on_mount:a,on_destroy:c,after_update:u}=t.$$;l&&l.m(n,i),r||T((()=>{const n=a.map(e).filter(o);c?c.push(...n):s(n),t.$$.on_mount=[]})),u.forEach(T)}function Z(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function tt(t,e){-1===t.$$.dirty[0]&&(A.push(t),D||(D=!0,M.then(j)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function et(e,o,i,r,l,a,u,d=[-1]){const p=x;E(e);const f=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(p?p.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:o.target||p.$$.root};u&&u(f.root);let m=!1;if(f.ctx=i?i(e,o.props||{},((t,n,...s)=>{const o=s.length?s[0]:n;return f.ctx&&l(f.ctx[t],f.ctx[t]=o)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](o),m&&tt(e,t)),n})):[],f.update(),m=!0,s(f.before_update),f.fragment=!!r&&r(f.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);f.fragment&&f.fragment.l(t),t.forEach(c)}else f.fragment&&f.fragment.c();o.intro&&q(e.$$.fragment),Q(e,o.target,o.anchor,o.customElement),j()}E(p)}var nt;"function"==typeof HTMLElement&&(F=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(e).filter(o);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}disconnectedCallback(){s(this.$$.on_disconnect)}$destroy(){Z(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});var st=new Uint8Array(16);function ot(){if(!nt&&!(nt="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return nt(st)}var it=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function rt(t){return"string"==typeof t&&it.test(t)}for(var lt,at,ct,ut,dt=[],pt=0;pt<256;++pt)dt.push((pt+256).toString(16).substr(1));function ft(t,e,n){var s=(t=t||{}).random||(t.rng||ot)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,e){n=n||0;for(var o=0;o<16;++o)e[n+o]=s[o];return e}return function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=(dt[t[e+0]]+dt[t[e+1]]+dt[t[e+2]]+dt[t[e+3]]+"-"+dt[t[e+4]]+dt[t[e+5]]+"-"+dt[t[e+6]]+dt[t[e+7]]+"-"+dt[t[e+8]]+dt[t[e+9]]+"-"+dt[t[e+10]]+dt[t[e+11]]+dt[t[e+12]]+dt[t[e+13]]+dt[t[e+14]]+dt[t[e+15]]).toLowerCase();if(!rt(n))throw TypeError("Stringified UUID is invalid");return n}(s)}function mt(t){const e=+t;return"number"==typeof e&&!isNaN(e)&&e>=0&&e.toFixed(0)===e.toString()}class ht{constructor(t="nw_"+ft().split("-")[0],e="10.20.0.0/16"){this.name=t,this.ipRange=e}get valid(){const{name:t,ipRange:e}=this;return""!==t&&""!==e}}class gt{constructor(t=ft(),e="SSH_KEY",n="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDTwULSsUubOq3VPWL6cdrDvexDmjfznGydFPyaNcn7gAL9lRxwFbCDPMj7MbhNSpxxHV2+/iJPQOTVJu4oc1N7bPP3gBCnF51rPrhTpGCt5pBbTzeyNweanhedkKDsCO2mIEh/92Od5Hg512dX4j7Zw6ipRWYSaepapfyoRnNSriW/s3DH/uewezVtL5EuypMdfNngV/u2KZYWoeiwhrY/yEUykQVUwDysW/xUJNP5o+KSTAvNSJatr3FbuCFuCjBSvageOLHePTeUwu6qjqe+Xs4piF1ByO/6cOJ8bt5Vcx0bAtI8/MPApplUU/JWevsPNApvnA/ntffI+u8DCwgP"){this.id=t,this.key=e,this.value=n}get valid(){const{key:t,value:e}=this;return""!==t&&""!==e}}class $t{constructor(t=ft(),e="vm_"+t.split("-")[0],n="https://hub.grid.tf/tf-official-apps/base:latest.flist",s=4,o=8192,i="/sbin/zinit init",r=!0,l,a=25,c=new ht,u=[],d=[],p=!1){this.id=t,this.name=e,this.flist=n,this.cpu=s,this.memory=o,this.entrypoint=i,this.planetary=r,this.nodeId=l,this.rootFsSize=a,this.network=c,this.envs=u,this.disks=d,this.publicIp=p}get valid(){const{name:t,flist:e,cpu:n,memory:s,entrypoint:o,nodeId:i}=this,{rootFsSize:r,network:l,envs:a,disks:c}=this;return""!==t&&""!==e&&""!==o&&mt(n)&&mt(s)&&mt(i)&&mt(r)&&l.valid&&a.reduce(((t,e)=>t&&e.valid),!0)&&c.reduce(((t,e)=>t&&e.valid),!0)}}
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */const{HTTPMessageBusClient:bt}=null!==(at=null===(lt=window.configs)||void 0===lt?void 0:lt.client)&&void 0!==at?at:{},{GridClient:yt,NetworkModel:vt,DiskModel:wt,MachineModel:_t,MachinesModel:xt,GatewayNameModel:Et}=null!==(ut=null===(ct=window.configs)||void 0===ct?void 0:ct.grid3_client)&&void 0!==ut?ut:{};async function kt(t,e){const n=function(t,e){var n={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&e.indexOf(s)<0&&(n[s]=t[s]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(s=Object.getOwnPropertySymbols(t);o<s.length;o++)e.indexOf(s[o])<0&&Object.prototype.propertyIsEnumerable.call(t,s[o])&&(n[s[o]]=t[s[o]])}return n}(t,["envs","disks"]),{name:s,flist:o,cpu:i,memory:r,entrypoint:l,network:a}=n,{publicIp:c,planetary:u,nodeId:d,rootFsSize:p}=n,{mnemonics:f,storeSecret:m,networkEnv:h}=e,g=new bt(0,""),$=new yt(h,f,m,g,void 0,"tfkvstore");await $.connect();const b=new vt;b.name=s+"_network",b.ip_range="10.1.0.0/16",await async function(t,e,n,s){const o=new wt;o.name=s+"_redis_data",o.size=10,o.mountpoint="/data";const i=new _t;i.name=s+"_redis_vm",i.node_id=n,i.disks=[o],i.public_ip=!1,i.planetary=!0,i.cpu=1,i.memory=256,i.rootfs_size=1,i.flist="https://hub.grid.tf/omar0.3bot/omarelawady-redis-grid3.flist",i.entrypoint="/start.sh",i.env={PASSWORD:"omar123456"};const r=new xt;return r.name=s+"_redis_vms",r.network=e,r.machines=[i],t.machines.deploy(r)}($,b,d,s);const y=await async function(t,e){return await t.machines.getObj(e)}($,s+"_redis_vms"),v=y[0].interfaces[0].ip;await async function(t,e,n,s){const o=new wt;o.name=s+"_postgres_data",o.size=10,o.mountpoint="/var/lib/postgresql/data";const i=new _t;i.name=s+"_postgres_vm",i.node_id=n,i.disks=[o],i.public_ip=!1,i.planetary=!0,i.cpu=1,i.memory=256,i.rootfs_size=1,i.flist="https://hub.grid.tf/omar0.3bot/omarelawady-postgres-grid3.flist",i.entrypoint="/start.sh",i.env={POSTGRES_PASSWORD:"omar123456",POSTGRES_DB:"peertube_prod",PGDATA:"/var/lib/postgresql/data"};const r=new xt;return r.name=s+"_postgres_vms",r.network=e,r.machines=[i],t.machines.deploy(r)}($,b,d,s);const w=await async function(t,e){return await t.machines.getObj(e)}($,s+"_postgres_vms"),_=w[0].interfaces[0].ip;await async function(t,e,n,s,o,i){const r=new wt;r.name=i+"_peertube_data",r.size=10,r.mountpoint="/data";const l=new _t;l.name=i+"_peertube_vm",l.node_id=o,l.disks=[r],l.public_ip=!1,l.planetary=!0,l.cpu=3,l.memory=2048,l.rootfs_size=1,l.flist="https://hub.grid.tf/omar0.3bot/omarelawady-peertube-grid3-tfconnect.flist",l.entrypoint="/start.sh",l.env={PEERTUBE_BIND_ADDRESS:"::",PEERTUBE_WEBSERVER_HOSTNAME:i+".gent01.dev.grid.tf",PEERTUBE_DB_HOSTNAME:s,PEERTUBE_DB_USERNAME:"postgres",PEERTUBE_DB_PASSWORD:"omar123456",PEERTUBE_REDIS_HOSTNAME:n,PEERTUBE_REDIS_AUTH:"omar123456"};const a=new xt;return a.name=i+"_peertube_vms",a.network=e,a.machines=[l],t.machines.deploy(a)}($,b,v,_,d,s);const x=await async function(t,e){return await t.machines.getObj(e)}($,s+"_postgres_vms"),E=x[0].yggIP;await async function(t,e,n){const s=new Et;return s.name=e+"_gateway",s.node_id=1,s.tls_passthrough=!1,s.backends=[`http://[${n}]:3000/`],t.gateway.deploy_name(s)}($,s,E);const k=await async function(t,e){return await t.gateway.getObj(e)}($,s+"_gateway"),S=k[0].domain;console.log({solution_name:s,gw:S,be:E})}function St(t,e,n){const s=t.slice();return s[19]=e[n],s}function Nt(t){let e,n;function s(t,n){return null==e&&(e=!!t[3]()),e?Rt:"checkbox"===t[1].type?Pt:"select"===t[1].type?At:void 0}let o=s(t),i=o&&o(t);return{c(){i&&i.c(),n=f()},m(t,e){i&&i.m(t,e),a(t,n,e)},p(t,e){o===(o=s(t))&&i?i.p(t,e):(i&&i.d(1),i=o&&o(t),i&&(i.c(),i.m(n.parentNode,n)))},d(t){i&&i.d(t),t&&c(n)}}}function At(t){let e,n,o,i,r,d=[],f=new Map,h=t[1].label&&Ct(t),$=t[1].options;const b=t=>t[19].value;for(let e=0;e<$.length;e+=1){let n=St(t,$,e),s=b(n);f.set(s,d[e]=Mt(s,n))}return{c(){h&&h.c(),e=p(),n=u("div"),o=u("select");for(let t=0;t<d.length;t+=1)d[t].c();v(o,"width","100%"),void 0===t[0]&&T((()=>t[17].call(o))),g(n,"class","select mb-2"),v(n,"width","100%"),g(n,"id",t[2])},m(s,c){h&&h.m(s,c),a(s,e,c),a(s,n,c),l(n,o);for(let t=0;t<d.length;t+=1)d[t].m(o,null);w(o,t[0]),i||(r=[m(o,"change",t[17]),m(o,"change",t[4])],i=!0)},p(t,n){t[1].label?h?h.p(t,n):(h=Ct(t),h.c(),h.m(e.parentNode,e)):h&&(h.d(1),h=null),2&n&&($=t[1].options,d=K(d,n,b,1,t,$,f,o,W,Mt,null,St)),3&n&&w(o,t[0])},d(t){h&&h.d(t),t&&c(e),t&&c(n);for(let t=0;t<d.length;t+=1)d[t].d();i=!1,s(r)}}}function Pt(t){let e,n,o,i,r,f,h,$,y,w,_=t[1].label+"";return{c(){e=u("div"),n=u("label"),o=u("input"),i=p(),r=u("span"),f=p(),h=u("label"),$=d(_),g(o,"class","switch__input"),g(o,"type","checkbox"),g(o,"id",t[2]),g(r,"class","slider"),g(n,"class","switch"),g(h,"for",t[2]),g(h,"class","label ml-2"),v(h,"cursor","pointer"),v(e,"display","flex"),v(e,"align-items","center"),g(e,"class","mb-2")},m(s,c){a(s,e,c),l(e,n),l(n,o),o.checked=t[0],l(n,i),l(n,r),l(e,f),l(e,h),l(h,$),y||(w=[m(o,"change",t[16]),m(o,"input",t[11])],y=!0)},p(t,e){3&e&&(o.checked=t[0]),2&e&&_!==(_=t[1].label+"")&&b($,_)},d(t){t&&c(e),y=!1,s(w)}}}function Rt(t){let e,n,s,o,i,r=t[1].label+"";function f(t,e){return"textarea"===t[1].type?It:"text"===t[1].type?Ot:"number"===t[1].type?Tt:"password"===t[1].type?Dt:void 0}let m=f(t),h=m&&m(t);return{c(){e=u("div"),n=u("p"),s=d(r),o=p(),i=u("div"),h&&h.c(),g(n,"class","label"),g(i,"class","control"),g(e,"class","field"),g(e,"id",t[2])},m(t,r){a(t,e,r),l(e,n),l(n,s),l(e,o),l(e,i),h&&h.m(i,null)},p(t,e){2&e&&r!==(r=t[1].label+"")&&b(s,r),m===(m=f(t))&&h?h.p(t,e):(h&&h.d(1),h=m&&m(t),h&&(h.c(),h.m(i,null)))},d(t){t&&c(e),h&&h.d()}}}function Ct(t){let e,n,s=t[1].label+"";return{c(){e=u("p"),n=d(s),g(e,"class","label")},m(t,s){a(t,e,s),l(e,n)},p(t,e){2&e&&s!==(s=t[1].label+"")&&b(n,s)},d(t){t&&c(e)}}}function Mt(t,e){let n,s,o,i,r,f,m=e[19].label+"";return{key:t,first:null,c(){n=u("option"),s=d(m),o=p(),n.__value=i=e[19].value,n.value=n.__value,n.selected=r=e[19].selected,n.disabled=f=e[19].disabled,this.first=n},m(t,e){a(t,n,e),l(n,s),l(n,o)},p(t,o){e=t,2&o&&m!==(m=e[19].label+"")&&b(s,m),2&o&&i!==(i=e[19].value)&&(n.__value=i,n.value=n.__value),2&o&&r!==(r=e[19].selected)&&(n.selected=r),2&o&&f!==(f=e[19].disabled)&&(n.disabled=f)},d(t){t&&c(n)}}}function Dt(t){let e,n,o,i;return{c(){e=u("input"),g(e,"type","password"),g(e,"class","input"),g(e,"placeholder",n=t[1].placeholder)},m(n,s){a(n,e,s),y(e,t[0]),o||(i=[m(e,"input",t[15]),m(e,"input",t[10])],o=!0)},p(t,s){2&s&&n!==(n=t[1].placeholder)&&g(e,"placeholder",n),3&s&&e.value!==t[0]&&y(e,t[0])},d(t){t&&c(e),o=!1,s(i)}}}function Tt(t){let e,n,o,i;return{c(){e=u("input"),g(e,"type","number"),g(e,"class","input"),g(e,"placeholder",n=t[1].placeholder)},m(n,s){a(n,e,s),y(e,t[0]),o||(i=[m(e,"input",t[14]),m(e,"input",t[9])],o=!0)},p(t,s){2&s&&n!==(n=t[1].placeholder)&&g(e,"placeholder",n),3&s&&$(e.value)!==t[0]&&y(e,t[0])},d(t){t&&c(e),o=!1,s(i)}}}function Ot(t){let e,n,o,i;return{c(){e=u("input"),g(e,"type","text"),g(e,"class","input"),g(e,"placeholder",n=t[1].placeholder)},m(n,s){a(n,e,s),y(e,t[0]),o||(i=[m(e,"input",t[13]),m(e,"input",t[8])],o=!0)},p(t,s){2&s&&n!==(n=t[1].placeholder)&&g(e,"placeholder",n),3&s&&e.value!==t[0]&&y(e,t[0])},d(t){t&&c(e),o=!1,s(i)}}}function It(t){let e,n,o,i;return{c(){e=u("textarea"),g(e,"class","textarea"),g(e,"placeholder",n=t[1].placeholder)},m(n,s){a(n,e,s),y(e,t[0]),o||(i=[m(e,"input",t[12]),m(e,"input",t[7])],o=!0)},p(t,s){2&s&&n!==(n=t[1].placeholder)&&g(e,"placeholder",n),3&s&&y(e,t[0])},d(t){t&&c(e),o=!1,s(i)}}}function Bt(e){let n,s,o,i=e[1]&&Nt(e);return{c(){n=u("div"),s=p(),i&&i.c(),o=f(),this.c=t},m(t,r){a(t,n,r),n.innerHTML=e[5],a(t,s,r),i&&i.m(t,r),a(t,o,r)},p(t,[e]){t[1]?i?i.p(t,e):(i=Nt(t),i.c(),i.m(o.parentNode,o)):i&&(i.d(1),i=null)},i:t,o:t,d(t){t&&c(n),t&&c(s),i&&i.d(t),t&&c(o)}}}function jt(t,e,n){const s=S();let{field:o}=e,{data:i}=e,{selected:r=0}=e;const l=ft();return t.$$set=t=>{"field"in t&&n(1,o=t.field),"data"in t&&n(0,i=t.data),"selected"in t&&n(6,r=t.selected)},[i,o,l,()=>["text","number","password","textarea"].includes(o.type),function(t){s("input");const e=t.target;n(6,r=e.selectedIndex)},'\n<style>\n  .switch {\n    position: relative;\n    display: inline-block;\n    width: 60px;\n    height: 34px;\n  }\n\n  .switch .switch__input {\n    opacity: 0;\n    width: 0;\n    height: 0;\n  }\n\n  .slider {\n    position: absolute;\n    cursor: pointer;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-color: #ccc;\n    -webkit-transition: 0.4s;\n    transition: 0.4s;\n    border-radius: 34px;\n  }\n\n  .slider:before {\n    position: absolute;\n    content: "";\n    height: 26px;\n    width: 26px;\n    left: 4px;\n    bottom: 4px;\n    background-color: white;\n    -webkit-transition: 0.4s;\n    transition: 0.4s;\n    border-radius: 50%;\n  }\n\n  .switch__input:checked + .slider {\n    background-color: #2196f3;\n  }\n\n  .switch__input:checked + .slider {\n    box-shadow: 0 0 1px #2196f3;\n  }\n\n  .switch__input:checked + .slider:before {\n    -webkit-transform: translateX(26px);\n    -ms-transform: translateX(26px);\n    transform: translateX(26px);\n  }\n</style>\n',r,function(e){N.call(this,t,e)},function(e){N.call(this,t,e)},function(e){N.call(this,t,e)},function(e){N.call(this,t,e)},function(e){N.call(this,t,e)},function(){i=this.value,n(0,i),n(1,o)},function(){i=this.value,n(0,i),n(1,o)},function(){i=$(this.value),n(0,i),n(1,o)},function(){i=this.value,n(0,i),n(1,o)},function(){i=this.checked,n(0,i),n(1,o)},function(){i=function(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}(this),n(0,i),n(1,o)}]}class Ut extends F{constructor(t){super(),et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},jt,Bt,i,{field:1,data:0,selected:6},null),t&&(t.target&&a(t.target,this,t.anchor),t.props&&(this.$set(t.props),j()))}static get observedAttributes(){return["field","data","selected"]}get field(){return this.$$.ctx[1]}set field(t){this.$$set({field:t}),j()}get data(){return this.$$.ctx[0]}set data(t){this.$$set({data:t}),j()}get selected(){return this.$$.ctx[6]}set selected(t){this.$$set({selected:t}),j()}}function zt(e){let n,s,o,i,r;function d(t){e[4](t)}let p={field:{type:"select",symbol:"selected",options:e[1]}};return void 0!==e[0]&&(p.data=e[0]),o=new Ut({props:p}),P.push((()=>Y(o,"data",d))),o.$on("input",e[3]),{c(){n=u("div"),s=u("div"),X(o.$$.fragment),this.c=t,g(n,"class","is-flex is-justify-content-flex-end is-align-items-center")},m(t,e){a(t,n,e),l(n,s),Q(o,s,null),r=!0},p(t,[e]){const n={};2&e&&(n.field={type:"select",symbol:"selected",options:t[1]}),!i&&1&e&&(i=!0,n.data=t[0],O((()=>i=!1))),o.$set(n)},i(t){r||(q(o.$$.fragment,t),r=!0)},o(t){G(o.$$.fragment,t),r=!1},d(t){t&&c(n),Z(o)}}}function Lt(t,e,n){let s;var o;const i=S();let l="0";const a=null===(o=window.configs)||void 0===o?void 0:o.baseConfig;let c;r(t,a,(t=>n(7,s=t)));let u=[];function d(){c=s,n(1,u=c.map(((t,e)=>({label:t.name||`Profile ${e+1}`,value:e.toString()})))),i("profile",c[l])}let p=a.subscribe((()=>{d()}));var f;return f=d,k().$$.on_mount.push(f),function(t){k().$$.on_destroy.push(t)}(p),[l,u,a,d,function(t){l=t,n(0,l)}]}customElements.define("tf-input",Ut);class Ft extends F{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");</style>',et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},Lt,zt,i,{},null),t&&t.target&&a(t.target,this,t.anchor)}}function Ht(t,e,n){const s=t.slice();return s[6]=e[n],s[8]=n,s}function Vt(t){let e,n=[],s=new Map,o=t[1];const i=t=>t[6].label;for(let e=0;e<o.length;e+=1){let r=Ht(t,o,e),l=i(r);s.set(l,n[e]=Gt(l,r))}return{c(){for(let t=0;t<n.length;t+=1)n[t].c();e=f()},m(t,s){for(let e=0;e<n.length;e+=1)n[e].m(t,s);a(t,e,s)},p(t,r){11&r&&(o=t[1],n=K(n,r,i,1,t,o,s,e.parentNode,W,Gt,e,Ht))},d(t){for(let e=0;e<n.length;e+=1)n[e].d(t);t&&c(e)}}}function qt(t){let e,n,s;return{c(){e=u("button"),g(e,"class","ml-2 is-small delete")},m(i,r){var l;a(i,e,r),n||(s=m(e,"click",(l=h((function(){o(t[3](t[8]))&&t[3](t[8]).apply(this,arguments)})),function(t){return t.stopPropagation(),l.call(this,t)})),n=!0)},p(e,n){t=e},d(t){t&&c(e),n=!1,s()}}}function Gt(t,e){let n,s,o,i,r,f,$,y,v,w=e[6].label+"",_=e[6].removable&&qt(e);function x(){return e[4](e[6])}return{key:t,first:null,c(){n=u("li"),s=u("a"),o=u("span"),i=d(w),r=p(),_&&_.c(),f=p(),g(s,"href","#!"),g(n,"class",$=e[0]===e[6].value?"is-active":""),this.first=n},m(t,e){a(t,n,e),l(n,s),l(s,o),l(o,i),l(s,r),_&&_.m(s,null),l(n,f),y||(v=m(s,"click",h(x)),y=!0)},p(t,o){e=t,2&o&&w!==(w=e[6].label+"")&&b(i,w),e[6].removable?_?_.p(e,o):(_=qt(e),_.c(),_.m(s,null)):_&&(_.d(1),_=null),3&o&&$!==($=e[0]===e[6].value?"is-active":"")&&g(n,"class",$)},d(t){t&&c(n),_&&_.d(),y=!1,v()}}}function Wt(e){let n,s,o,i=e[1]&&Vt(e);return{c(){n=u("div"),s=u("ul"),i&&i.c(),this.c=t,g(n,"class",o="tabs "+(e[2]?"is-centered":""))},m(t,e){a(t,n,e),l(n,s),i&&i.m(s,null)},p(t,[e]){t[1]?i?i.p(t,e):(i=Vt(t),i.c(),i.m(s,null)):i&&(i.d(1),i=null),4&e&&o!==(o="tabs "+(t[2]?"is-centered":""))&&g(n,"class",o)},i:t,o:t,d(t){t&&c(n),i&&i.d()}}}function Jt(t,e,n){const s=S();let{tabs:o}=e,{active:i}=e,{centered:r=!0}=e;return t.$$set=t=>{"tabs"in t&&n(1,o=t.tabs),"active"in t&&n(0,i=t.active),"centered"in t&&n(2,r=t.centered)},[i,o,r,t=>()=>s("removed",t),t=>n(0,i=t.value)]}customElements.define("tf-select-profile",Ft);class Kt extends F{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");</style>',et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},Jt,Wt,i,{tabs:1,active:0,centered:2},null),t&&(t.target&&a(t.target,this,t.anchor),t.props&&(this.$set(t.props),j()))}static get observedAttributes(){return["tabs","active","centered"]}get tabs(){return this.$$.ctx[1]}set tabs(t){this.$$set({tabs:t}),j()}get active(){return this.$$.ctx[0]}set active(t){this.$$set({active:t}),j()}get centered(){return this.$$.ctx[2]}set centered(t){this.$$set({centered:t}),j()}}var Yt,Xt;customElements.define("tf-tabs",Kt);const{GridClient:Qt,Nodes:Zt}=null!==(Xt=null===(Yt=window.configs)||void 0===Yt?void 0:Yt.grid3_client)&&void 0!==Xt?Xt:{};var te,ee;const{GridClient:ne}=null!==(ee=null===(te=window.configs)||void 0===te?void 0:te.grid3_client)&&void 0!==ee?ee:{};function se(t,e,n,s={}){const{networkEnv:o}=t,i=new ne("","","",null),{graphql:r}=i.getDefaultUrls(o);return fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:n,variables:s})}).then((t=>t.json())).then((t=>t.data[e]))}function oe(t,e,n){const s=t.slice();return s[20]=e[n],s[21]=e,s[22]=n,s}function ie(t){let e,n,s;function o(e){t[17](e)}let i={field:t[7]};return void 0!==t[0]&&(i.data=t[0]),e=new Ut({props:i}),P.push((()=>Y(e,"data",o))),{c(){X(e.$$.fragment)},m(t,n){Q(e,t,n),s=!0},p(t,s){const o={};!n&&1&s&&(n=!0,o.data=t[0],O((()=>n=!1))),e.$set(o)},i(t){s||(q(e.$$.fragment,t),s=!0)},o(t){G(e.$$.fragment,t),s=!1},d(t){Z(e,t)}}}function re(t){let e,n,s,o,i,r,f,h,$,b,y,v,w=[],_=new Map,x=t[1];const E=t=>t[20].symbol;for(let e=0;e<x.length;e+=1){let n=oe(t,x,e),s=E(n);_.set(s,w[e]=le(s,n))}function k(e){t[16](e)}let S={field:t[3]};return void 0!==t[0]&&(S.data=t[0]),h=new Ut({props:S}),P.push((()=>Y(h,"data",k))),{c(){e=u("h5"),e.textContent="Nodes Filter",n=p();for(let t=0;t<w.length;t+=1)w[t].c();s=p(),o=u("button"),i=d("Apply Filters"),f=p(),X(h.$$.fragment),g(e,"class","is-size-7 has-text-weight-bold"),g(o,"class",r="button is-primary mt-2 "+(t[5]?"is-loading":"")),o.disabled=t[5],g(o,"type","button")},m(r,c){a(r,e,c),a(r,n,c);for(let t=0;t<w.length;t+=1)w[t].m(r,c);a(r,s,c),a(r,o,c),l(o,i),a(r,f,c),Q(h,r,c),b=!0,y||(v=m(o,"click",t[8]),y=!0)},p(t,e){18&e&&(x=t[1],H(),w=K(w,e,E,1,t,x,_,s.parentNode,J,le,s,oe),V()),(!b||32&e&&r!==(r="button is-primary mt-2 "+(t[5]?"is-loading":"")))&&g(o,"class",r),(!b||32&e)&&(o.disabled=t[5]);const n={};8&e&&(n.field=t[3]),!$&&1&e&&($=!0,n.data=t[0],O((()=>$=!1))),h.$set(n)},i(t){if(!b){for(let t=0;t<x.length;t+=1)q(w[t]);q(h.$$.fragment,t),b=!0}},o(t){for(let t=0;t<w.length;t+=1)G(w[t]);G(h.$$.fragment,t),b=!1},d(t){t&&c(e),t&&c(n);for(let e=0;e<w.length;e+=1)w[e].d(t);t&&c(s),t&&c(o),t&&c(f),Z(h,t),y=!1,v()}}}function le(t,e){let n,s,o,i;function r(t){e[15](t,e[20])}let l={field:e[20]};return void 0!==e[4][e[20].symbol]&&(l.data=e[4][e[20].symbol]),s=new Ut({props:l}),P.push((()=>Y(s,"data",r))),{key:t,first:null,c(){n=f(),X(s.$$.fragment),this.first=n},m(t,e){a(t,n,e),Q(s,t,e),i=!0},p(t,n){e=t;const i={};2&n&&(i.field=e[20]),!o&&18&n&&(o=!0,i.data=e[4][e[20].symbol],O((()=>o=!1))),s.$set(i)},i(t){i||(q(s.$$.fragment,t),i=!0)},o(t){G(s.$$.fragment,t),i=!1},d(t){t&&c(n),Z(s,t)}}}function ae(e){let n,s,o,i,r,l,u;function d(t){e[14](t)}let m={field:e[6]};void 0!==e[2]&&(m.data=e[2]),n=new Ut({props:m}),P.push((()=>Y(n,"data",d)));const h=[re,ie],g=[];function $(t,e){return"automatic"===t[2]?0:"manual"===t[2]?1:-1}return~(i=$(e))&&(r=g[i]=h[i](e)),{c(){X(n.$$.fragment),o=p(),r&&r.c(),l=f(),this.c=t},m(t,e){Q(n,t,e),a(t,o,e),~i&&g[i].m(t,e),a(t,l,e),u=!0},p(t,[e]){const o={};!s&&4&e&&(s=!0,o.data=t[2],O((()=>s=!1))),n.$set(o);let a=i;i=$(t),i===a?~i&&g[i].p(t,e):(r&&(H(),G(g[a],1,1,(()=>{g[a]=null})),V()),~i?(r=g[i],r?r.p(t,e):(r=g[i]=h[i](t),r.c()),q(r,1),r.m(l.parentNode,l)):r=null)},i(t){u||(q(n.$$.fragment,t),q(r),u=!0)},o(t){G(n.$$.fragment,t),G(r),u=!1},d(t){Z(n,t),t&&c(o),~i&&g[i].d(t),t&&c(l)}}}function ce(t,e,n){let{cpu:s}=e,{memory:o}=e,{ssd:i}=e;const r=[{label:"Farm Name",symbol:"farmName",type:"select",placeholder:"Enter farm name",options:[{label:"Please select a farm",value:null,selected:!0,disabled:!0}]},{label:"Country",symbol:"country",type:"text",placeholder:"Enter a country name"},{label:"CPU (Cores)",symbol:"cru",type:"number",placeholder:"Enter CPU"},{label:"Memory (GB)",symbol:"mru",type:"number",placeholder:"Enter Memory"},{label:"SSD (GB)",symbol:"sru",type:"number",placeholder:"Enter SSD size"}],l={label:"Node ID",type:"select",symbol:"nodeId",options:[{label:"Please select a node id.",value:null,selected:!0,disabled:!0}]};let a=null;const c={publicIPs:null,country:null,farmName:null,cru:null,mru:null,sru:null};let{profile:u}=e,d=!1;let{data:p}=e;let f;return t.$$set=t=>{"cpu"in t&&n(9,s=t.cpu),"memory"in t&&n(10,o=t.memory),"ssd"in t&&n(11,i=t.ssd),"profile"in t&&n(12,u=t.profile),"data"in t&&n(0,p=t.data)},t.$$.update=()=>{if(3584&t.$$.dirty&&(s&&n(4,c.cru=s,c),o&&n(4,c.mru=Math.floor(o/1e3),c),i&&n(4,c.sru=i,c)),12294&t.$$.dirty&&"automatic"===a&&u&&u.networkEnv!==f){const t=r[0].options[0].label;n(1,r[0].options[0].label="Loading...",r),n(13,f=u.networkEnv),se(u,"farmsConnection","\n    {\n      farmsConnection {\n        limit: totalCount\n      }\n    }\n").then((t=>(console.log({vars:t}),se(u,"farms","\n    query getFarmsName($limit: Int!) {\n      farms(limit: $limit) {\n        name\n      }\n    }\n",t)))).then((e=>{console.log({farms:e});const[s]=r[0].options,o=e.map((({name:t})=>({label:t,value:t})));o.unshift(s),s.label=t,n(1,r[0].options=o,r)})).catch((t=>{console.log("Error",t)}))}},[p,r,a,l,c,d,{label:"Node Selection",type:"select",symbol:"value",options:[{label:"Choose a way to select node",value:null,selected:!0,disabled:!0},{label:"Automatic",value:"automatic"},{label:"Manual",value:"manual"}]},{label:"Node ID",symbol:"nodeId",type:"number",placeholder:"Your Node ID"},function(){n(5,d=!0),function(t,e){return new Promise((async n=>{const{networkEnv:s}=e,o=new Qt("","","",null),{graphql:i,rmbProxy:r}=o.getDefaultUrls(s),l=new Zt(i,r);try{console.log(l);const e=await l.filterNodes(t);console.log({items:e}),n(e.map((t=>({label:`NodeID(${t.nodeId})`,value:t.nodeId}))))}catch(t){n([])}}))}(c,u).then((t=>{const[e]=l.options;t.unshift(e),n(3,l.options=t,l)})).finally((()=>n(5,d=!1)))},s,o,i,u,f,function(t){a=t,n(2,a)},function(e,r){t.$$.not_equal(c[r.symbol],e)&&(c[r.symbol]=e,n(4,c),n(9,s),n(10,o),n(11,i))},function(t){p=t,n(0,p)},function(t){p=t,n(0,p)}]}class ue extends F{constructor(t){super(),et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},ce,ae,i,{cpu:9,memory:10,ssd:11,profile:12,data:0},null),t&&(t.target&&a(t.target,this,t.anchor),t.props&&(this.$set(t.props),j()))}static get observedAttributes(){return["cpu","memory","ssd","profile","data"]}get cpu(){return this.$$.ctx[9]}set cpu(t){this.$$set({cpu:t}),j()}get memory(){return this.$$.ctx[10]}set memory(t){this.$$set({memory:t}),j()}get ssd(){return this.$$.ctx[11]}set ssd(t){this.$$set({ssd:t}),j()}get profile(){return this.$$.ctx[12]}set profile(t){this.$$set({profile:t}),j()}get data(){return this.$$.ctx[0]}set data(t){this.$$set({data:t}),j()}}function de(t){let e;return{c(){e=d("Deploy")},m(t,n){a(t,e,n)},d(t){t&&c(e)}}}function pe(t){let e;return{c(){e=d("Back")},m(t,n){a(t,e,n)},d(t){t&&c(e)}}}function fe(e){let n,s,o,i,r;function d(t,e){return t[1]||t[2]?pe:de}let p=d(e),f=p(e);return{c(){n=u("div"),s=u("button"),f.c(),this.c=t,g(s,"class",o="button is-primary "+(e[0]?"is-loading":"")),g(s,"type","submit"),s.disabled=e[3],g(n,"class","is-flex is-justify-content-flex-end is-align-items-center")},m(t,o){a(t,n,o),l(n,s),f.m(s,null),i||(r=m(s,"click",e[4]),i=!0)},p(t,[e]){p!==(p=d(t))&&(f.d(1),f=p(t),f&&(f.c(),f.m(s,null))),1&e&&o!==(o="button is-primary "+(t[0]?"is-loading":""))&&g(s,"class",o),8&e&&(s.disabled=t[3])},i:t,o:t,d(t){t&&c(n),f.d(),i=!1,r()}}}function me(t,e,n){let{loading:s}=e,{success:o}=e,{failed:i}=e,{disabled:r}=e;return t.$$set=t=>{"loading"in t&&n(0,s=t.loading),"success"in t&&n(1,o=t.success),"failed"in t&&n(2,i=t.failed),"disabled"in t&&n(3,r=t.disabled)},[s,o,i,r,function(e){N.call(this,t,e)}]}customElements.define("tf-select-node-id",ue);class he extends F{constructor(t){super(),et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},me,fe,i,{loading:0,success:1,failed:2,disabled:3},null),t&&(t.target&&a(t.target,this,t.anchor),t.props&&(this.$set(t.props),j()))}static get observedAttributes(){return["loading","success","failed","disabled"]}get loading(){return this.$$.ctx[0]}set loading(t){this.$$set({loading:t}),j()}get success(){return this.$$.ctx[1]}set success(t){this.$$set({success:t}),j()}get failed(){return this.$$.ctx[2]}set failed(t){this.$$set({failed:t}),j()}get disabled(){return this.$$.ctx[3]}set disabled(t){this.$$set({disabled:t}),j()}}function ge(e){let n,s,o,i;return{c(){n=u("div"),s=d("/> "),o=d(e[1]),this.c=t,g(n,"class",i="notification is-"+e[0])},m(t,e){a(t,n,e),l(n,s),l(n,o)},p(t,[e]){2&e&&b(o,t[1]),1&e&&i!==(i="notification is-"+t[0])&&g(n,"class",i)},i:t,o:t,d(t){t&&c(n)}}}function $e(t,e,n){let{type:s}=e,{message:o}=e;return t.$$set=t=>{"type"in t&&n(0,s=t.type),"message"in t&&n(1,o=t.message)},[s,o]}customElements.define("tf-deploy-btn",he);class be extends F{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");</style>',et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},$e,ge,i,{type:0,message:1},null),t&&(t.target&&a(t.target,this,t.anchor),t.props&&(this.$set(t.props),j()))}static get observedAttributes(){return["type","message"]}get type(){return this.$$.ctx[0]}set type(t){this.$$set({type:t}),j()}get message(){return this.$$.ctx[1]}set message(t){this.$$set({message:t}),j()}}function ye(t){let e,n,s,o,i,r,l;function u(e){t[12](e)}e=new Ft({}),e.$on("profile",t[11]);let d={tabs:t[8]};void 0!==t[5]&&(d.active=t[5]),s=new Kt({props:d}),P.push((()=>Y(s,"active",u)));let m="base"===t[5]&&xe(t);return{c(){X(e.$$.fragment),n=p(),X(s.$$.fragment),i=p(),m&&m.c(),r=f()},m(t,o){Q(e,t,o),a(t,n,o),Q(s,t,o),a(t,i,o),m&&m.m(t,o),a(t,r,o),l=!0},p(t,e){const n={};!o&&32&e&&(o=!0,n.active=t[5],O((()=>o=!1))),s.$set(n),"base"===t[5]?m?(m.p(t,e),32&e&&q(m,1)):(m=xe(t),m.c(),q(m,1),m.m(r.parentNode,r)):m&&(H(),G(m,1,1,(()=>{m=null})),V())},i(t){l||(q(e.$$.fragment,t),q(s.$$.fragment,t),q(m),l=!0)},o(t){G(e.$$.fragment,t),G(s.$$.fragment,t),G(m),l=!1},d(t){Z(e,t),t&&c(n),Z(s,t),t&&c(i),m&&m.d(t),t&&c(r)}}}function ve(t){let e,n;return e=new be({props:{type:"danger",message:t[6]||"Failed to deploy VM."}}),{c(){X(e.$$.fragment)},m(t,s){Q(e,t,s),n=!0},p(t,n){const s={};64&n&&(s.message=t[6]||"Failed to deploy VM."),e.$set(s)},i(t){n||(q(e.$$.fragment,t),n=!0)},o(t){G(e.$$.fragment,t),n=!1},d(t){Z(e,t)}}}function we(e){let n,s;return n=new be({props:{type:"success",message:"Successfully deployed VM."}}),{c(){X(n.$$.fragment)},m(t,e){Q(n,t,e),s=!0},p:t,i(t){s||(q(n.$$.fragment,t),s=!0)},o(t){G(n.$$.fragment,t),s=!1},d(t){Z(n,t)}}}function _e(t){let e,n;return e=new be({props:{type:"info",message:t[6]||"Loading..."}}),{c(){X(e.$$.fragment)},m(t,s){Q(e,t,s),n=!0},p(t,n){const s={};64&n&&(s.message=t[6]||"Loading..."),e.$set(s)},i(t){n||(q(e.$$.fragment,t),n=!0)},o(t){G(e.$$.fragment,t),n=!1},d(t){Z(e,t)}}}function xe(t){let e,n,s,o,i,r;function l(e){t[13](e)}let u={field:t[9]};function d(e){t[14](e)}void 0!==t[0].name&&(u.data=t[0].name),e=new Ut({props:u}),P.push((()=>Y(e,"data",l)));let f={cpu:t[0].cpu,memory:t[0].memory,ssd:t[0].disks.reduce(ke,t[0].rootFsSize),profile:t[4]};return void 0!==t[0].nodeId&&(f.data=t[0].nodeId),o=new ue({props:f}),P.push((()=>Y(o,"data",d))),{c(){X(e.$$.fragment),s=p(),X(o.$$.fragment)},m(t,n){Q(e,t,n),a(t,s,n),Q(o,t,n),r=!0},p(t,s){const r={};!n&&1&s&&(n=!0,r.data=t[0].name,O((()=>n=!1))),e.$set(r);const l={};1&s&&(l.cpu=t[0].cpu),1&s&&(l.memory=t[0].memory),1&s&&(l.ssd=t[0].disks.reduce(ke,t[0].rootFsSize)),16&s&&(l.profile=t[4]),!i&&1&s&&(i=!0,l.data=t[0].nodeId,O((()=>i=!1))),o.$set(l)},i(t){r||(q(e.$$.fragment,t),q(o.$$.fragment,t),r=!0)},o(t){G(e.$$.fragment,t),G(o.$$.fragment,t),r=!1},d(t){Z(e,t),t&&c(s),Z(o,t)}}}function Ee(e){let n,s,o,i,r,d,f,$,b,y,w,_,x;const E=[_e,we,ve,ye],k=[];function S(t,e){return t[1]?0:t[2]?1:t[3]?2:3}return f=S(e),$=k[f]=E[f](e),y=new he({props:{disabled:e[7],loading:e[1],failed:e[3],success:e[2]}}),y.$on("click",e[15]),{c(){n=u("div"),s=u("form"),o=u("h4"),o.textContent="Deploy a Peertube Instance",i=p(),r=u("hr"),d=p(),$.c(),b=p(),X(y.$$.fragment),this.c=t,g(o,"class","is-size-4"),g(s,"class","box"),v(n,"padding","15px")},m(t,c){a(t,n,c),l(n,s),l(s,o),l(s,i),l(s,r),l(s,d),k[f].m(s,null),l(s,b),Q(y,s,null),w=!0,_||(x=m(s,"submit",h(e[10])),_=!0)},p(t,[e]){let n=f;f=S(t),f===n?k[f].p(t,e):(H(),G(k[n],1,1,(()=>{k[n]=null})),V(),$=k[f],$?$.p(t,e):($=k[f]=E[f](t),$.c()),q($,1),$.m(s,b));const o={};128&e&&(o.disabled=t[7]),2&e&&(o.loading=t[1]),8&e&&(o.failed=t[3]),4&e&&(o.success=t[2]),y.$set(o)},i(t){w||(q($),q(y.$$.fragment,t),w=!0)},o(t){G($),G(y.$$.fragment,t),w=!1},d(t){t&&c(n),k[f].d(),Z(y),_=!1,x()}}}customElements.define("tf-alert",be);const ke=(t,e)=>t+e.size;function Se(t,e,n){let s;var o,i,r;let l=new $t;const{events:a}=null!==(i=null===(o=window.configs)||void 0===o?void 0:o.grid3_client)&&void 0!==i?i:{},c=null===(r=window.configs)||void 0===r?void 0:r.deploymentStore;let u,d,p="base",f=!1,m=!1,h=!1;return t.$$.update=()=>{31&t.$$.dirty&&n(7,s=(f||!l.valid)&&!(m||h)||!u||""===u.mnemonics||""===u.storeSecret)},[l,f,m,h,u,p,d,s,[{label:"Base",value:"base"}],{label:"Name",placeholder:"Virtual Machine Name",symbol:"name",type:"text"},function(){function t(t){"string"==typeof t&&n(6,d=t)}n(1,f=!0),n(2,m=!1),n(3,h=!1),n(6,d=void 0),a.addListener("logs",t),kt(l,u).then((()=>{c.set(0),n(2,m=!0)})).catch((t=>{n(3,h=!0),n(6,d="string"==typeof t?t:t.message)})).finally((()=>{n(1,f=!1),a.removeListener("logs",t)}))},({detail:t})=>{n(4,u=t),n(0,l.envs[0]=new gt(void 0,"SSH_KEY",t.sshKey),l)},function(t){p=t,n(5,p)},function(e){t.$$.not_equal(l.name,e)&&(l.name=e,n(0,l))},function(e){t.$$.not_equal(l.nodeId,e)&&(l.nodeId=e,n(0,l))},t=>{(m||h)&&(t.preventDefault(),n(2,m=!1),n(3,h=!1),n(1,f=!1))}]}customElements.define("tf-peertube",class extends F{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");</style>',et(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},Se,Ee,i,{},null),t&&t.target&&a(t.target,this,t.anchor)}})}();
