!function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function l(t){return"function"==typeof t}function r(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(n,e,o){n.$$.on_destroy.push(function(n,...e){if(null==n)return t;const o=n.subscribe(...e);return o.unsubscribe?()=>o.unsubscribe():o}(e,o))}function i(t,n){t.appendChild(n)}function s(t,n,e){t.insertBefore(n,e||null)}function u(t){t.parentNode.removeChild(t)}function a(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function d(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function m(){return f(" ")}function h(){return f("")}function p(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function g(t){return function(n){return n.preventDefault(),t.call(this,n)}}function b(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function v(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function y(t,n,e,o){t.style.setProperty(n,e,o?"important":"")}function k(t){const n={};for(const e of t)n[e.name]=e.value;return n}let $;function w(t){$=t}function x(){if(!$)throw new Error("Function called outside component initialization");return $}const _=[],C=[],P=[],N=[],E=Promise.resolve();let M=!1;function I(t){P.push(t)}let L=!1;const S=new Set;function T(){if(!L){L=!0;do{for(let t=0;t<_.length;t+=1){const n=_[t];w(n),j(n.$$)}for(w(null),_.length=0;C.length;)C.pop()();for(let t=0;t<P.length;t+=1){const n=P[t];S.has(n)||(S.add(n),n())}P.length=0}while(_.length);for(;N.length;)N.pop()();M=!1,L=!1,S.clear()}}function j(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(I)}}const K=new Set;let V,A;function D(t,n){t&&t.i&&(K.delete(t),t.i(n))}function H(t,n){const e=n.token={};function l(t,l,r,c){if(n.token!==e)return;n.resolved=c;let i=n.ctx;void 0!==r&&(i=i.slice(),i[r]=c);const s=t&&(n.current=t)(i);let u=!1;n.block&&(n.blocks?n.blocks.forEach(((t,e)=>{e!==l&&t&&(V={r:0,c:[],p:V},function(t,n,e,o){if(t&&t.o){if(K.has(t))return;K.add(t),V.c.push((()=>{K.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}(t,1,1,(()=>{n.blocks[e]===t&&(n.blocks[e]=null)})),V.r||o(V.c),V=V.p)})):n.block.d(1),s.c(),D(s,1),s.m(n.mount(),n.anchor),u=!0),n.block=s,n.blocks&&(n.blocks[l]=s),u&&T()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const e=x();if(t.then((t=>{w(e),l(n.then,1,n.value,t),w(null)}),(t=>{if(w(e),l(n.catch,2,n.error,t),w(null),!n.hasCatch)throw t})),n.current!==n.pending)return l(n.pending,0),!0}else{if(n.current!==n.then)return l(n.then,1,n.value,t),!0;n.resolved=t}var r}function O(t,n,e){const o=n.slice(),{resolved:l}=t;t.current===t.then&&(o[t.value]=l),t.current===t.catch&&(o[t.error]=l),t.block.p(o,e)}function F(t,n){t.d(1),n.delete(t.key)}function B(t,n,e,o,l,r,c,i,s,u,a,d){let f=t.length,m=r.length,h=f;const p={};for(;h--;)p[t[h].key]=h;const g=[],b=new Map,v=new Map;for(h=m;h--;){const t=d(l,r,h),i=e(t);let s=c.get(i);s?o&&s.p(t,n):(s=u(i,t),s.c()),b.set(i,g[h]=s),i in p&&v.set(i,Math.abs(h-p[i]))}const y=new Set,k=new Set;function $(t){D(t,1),t.m(i,a),c.set(t.key,t),a=t.first,m--}for(;f&&m;){const n=g[m-1],e=t[f-1],o=n.key,l=e.key;n===e?(a=n.first,f--,m--):b.has(l)?!c.has(o)||y.has(o)?$(n):k.has(l)?f--:v.get(o)>v.get(l)?(k.add(o),$(n)):(y.add(l),f--):(s(e,c),f--)}for(;f--;){const n=t[f];b.has(n.key)||s(n,c)}for(;m;)$(g[m-1]);return g}function R(t,n){-1===t.$$.dirty[0]&&(_.push(t),M||(M=!0,E.then(T)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function q(r,c,i,s,a,d,f,m=[-1]){const h=$;w(r);const p=r.$$={fragment:null,ctx:null,props:d,update:t,not_equal:a,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(h?h.$$.context:[])),callbacks:e(),dirty:m,skip_bound:!1,root:c.target||h.$$.root};f&&f(p.root);let g=!1;if(p.ctx=i?i(r,c.props||{},((t,n,...e)=>{const o=e.length?e[0]:n;return p.ctx&&a(p.ctx[t],p.ctx[t]=o)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](o),g&&R(r,t)),n})):[],p.update(),g=!0,o(p.before_update),p.fragment=!!s&&s(p.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);p.fragment&&p.fragment.l(t),t.forEach(u)}else p.fragment&&p.fragment.c();c.intro&&D(r.$$.fragment),function(t,e,r,c){const{fragment:i,on_mount:s,on_destroy:u,after_update:a}=t.$$;i&&i.m(e,r),c||I((()=>{const e=s.map(n).filter(l);u?u.push(...e):o(e),t.$$.on_mount=[]})),a.forEach(I)}(r,c.target,c.anchor,c.customElement),T()}w(h)}var z,G,J,U;"function"==typeof HTMLElement&&(A=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(n).filter(l);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,n,e){this[t]=e}disconnectedCallback(){o(this.$$.on_disconnect)}$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});const{HTTPMessageBusClient:W}=null!==(G=null===(z=window.configs)||void 0===z?void 0:z.client)&&void 0!==G?G:{},{GridClient:Q}=null!==(U=null===(J=window.configs)||void 0===J?void 0:J.grid3_client)&&void 0!==U?U:{};class X{constructor(t){this.grid=t}_loadK8s(t){return new Promise((n=>{this.grid.k8s.getObj(t).then((e=>{n({name:t,master:e.masters[0],workers:e.workers.length,details:e})})).catch((()=>n(null)))}))}loadK8s(){return this.grid.k8s.list().then((t=>Promise.all(t.map((t=>this._loadK8s(t)))))).then((t=>t.filter((t=>!1===[null,void 0].includes(t)))))}_loadVm(t){return new Promise((n=>{this.grid.machines.getObj(t).then((([t])=>n(t))).catch((()=>n(null)))}))}loadVm(){return this.grid.machines.list().then((t=>(console.log("names: "+t),Promise.all(t.map((t=>this._loadVm(t))))))).then((t=>(console.log(t),t.filter((t=>!1===[null,void 0].includes(t))))))}loadCaprover(){return this.loadVm().then((t=>t.filter((t=>t.name.startsWith("caprover_leader")))))}static async init(t){const{mnemonics:n,networkEnv:e,storeSecret:o}=t,l=new W(0,""),r=new Q(e,n,o,l,"","tfkvstore");return await r.connect(),new X(r)}}var Y,Z,tt,nt;const{GridClient:et}=null!==(Z=null===(Y=window.configs)||void 0===Y?void 0:Y.grid3_client)&&void 0!==Z?Z:{},{HTTPMessageBusClient:ot}=null!==(nt=null===(tt=window.configs)||void 0===tt?void 0:tt.client)&&void 0!==nt?nt:{};function lt(t,n,e){const o=t.slice();return o[31]=n[e],o[29]=e,o}function rt(t,n,e){const o=t.slice();return o[31]=n[e],o[29]=e,o}function ct(t,n,e){const o=t.slice();return o[0]=n[e],o}function it(t,n,e){const o=t.slice();return o[8]=n[e],o[29]=e,o}function st(t){let n,e,o,l=t[0].toLocaleUpperCase()+"";return{c(){n=f("("),e=f(l),o=f(")")},m(t,l){s(t,n,l),s(t,e,l),s(t,o,l)},p(t,n){1&n[0]&&l!==(l=t[0].toLocaleUpperCase()+"")&&v(e,l)},d(t){t&&u(n),t&&u(e),t&&u(o)}}}function ut(t){let n,e,o,l,r,c,a,f,g=!t[0]&&ft(t),v=(!t[0]&&"Kubernetes"===t[1]||"k8s"===t[0])&&ht(t),k=("Virtual Machines"===t[1]||"Caprover"===t[1]||"caprover"===t[0]||"vm"===t[0])&&Pt(t);return{c(){n=d("div"),e=d("button"),e.textContent="Back",o=m(),g&&g.c(),l=m(),v&&v.c(),r=m(),k&&k.c(),c=h(),b(e,"class","button is-primary is-outlined mr-2"),y(n,"display","flex")},m(u,d){s(u,n,d),i(n,e),i(n,o),g&&g.m(n,null),s(u,l,d),v&&v.m(u,d),s(u,r,d),k&&k.m(u,d),s(u,c,d),a||(f=p(e,"click",t[16]),a=!0)},p(t,e){t[0]?g&&(g.d(1),g=null):g?g.p(t,e):(g=ft(t),g.c(),g.m(n,null)),!t[0]&&"Kubernetes"===t[1]||"k8s"===t[0]?v?v.p(t,e):(v=ht(t),v.c(),v.m(r.parentNode,r)):v&&(v.d(1),v=null),"Virtual Machines"===t[1]||"Caprover"===t[1]||"caprover"===t[0]||"vm"===t[0]?k?k.p(t,e):(k=Pt(t),k.c(),k.m(c.parentNode,c)):k&&(k.d(1),k=null)},d(t){t&&u(n),g&&g.d(),t&&u(l),v&&v.d(t),t&&u(r),k&&k.d(t),t&&u(c),a=!1,f()}}}function at(t){let n,e,l,r,c,a,h,v,k,$,w,x=[],_=new Map,C=t[7];const P=t=>t[29];for(let n=0;n<C.length;n+=1){let e=it(t,C,n),o=P(e);_.set(o,x[n]=Ft(o,e))}return{c(){n=d("form"),e=d("div"),l=d("div"),r=d("select");for(let t=0;t<x.length;t+=1)x[t].c();c=m(),a=d("div"),h=d("button"),v=f("List"),b(l,"class","select mb-4"),y(l,"display","flex"),y(l,"justify-content","flex-end"),y(e,"display","flex"),y(e,"justify-content","center"),h.disabled=k=!t[8]||""===t[8].mnemonics||""===t[8].storeSecret,b(h,"type","submit"),b(h,"class","button is-primary"),y(a,"display","flex"),y(a,"justify-content","center")},m(o,u){s(o,n,u),i(n,e),i(e,l),i(l,r);for(let t=0;t<x.length;t+=1)x[t].m(r,null);i(n,c),i(n,a),i(a,h),i(h,v),$||(w=[p(r,"change",t[12]),p(n,"submit",g(t[11]))],$=!0)},p(t,n){128&n[0]&&(C=t[7],x=B(x,n,P,1,t,C,_,r,F,Ft,null,it)),256&n[0]&&k!==(k=!t[8]||""===t[8].mnemonics||""===t[8].storeSecret)&&(h.disabled=k)},d(t){t&&u(n);for(let t=0;t<x.length;t+=1)x[t].d();$=!1,o(w)}}}function dt(n){let e;return{c(){e=d("p"),e.textContent="Loading...",b(e,"style","text-align: center; mt-2 mb-2")},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function ft(t){let n,e,o,l=[],r=new Map,c=t[9];const a=t=>t[0].label;for(let n=0;n<c.length;n+=1){let e=ct(t,c,n),o=a(e);r.set(o,l[n]=mt(o,e))}return{c(){n=d("div"),e=d("div"),o=d("ul");for(let t=0;t<l.length;t+=1)l[t].c();b(e,"class","tabs is-centered"),y(n,"width","100%")},m(t,r){s(t,n,r),i(n,e),i(e,o);for(let t=0;t<l.length;t+=1)l[t].m(o,null)},p(t,n){514&n[0]&&(c=t[9],l=B(l,n,a,1,t,c,r,o,F,mt,null,ct))},d(t){t&&u(n);for(let t=0;t<l.length;t+=1)l[t].d()}}}function mt(t,n){let e,o,l,r,c,a,h,v,y=n[0].label+"";function k(){return n[17](n[0])}return{key:t,first:null,c(){e=d("li"),o=d("a"),l=d("span"),r=f(y),c=m(),b(o,"href","#!"),b(e,"class",a=n[1]===n[0].label?"is-active":""),this.first=e},m(t,n){s(t,e,n),i(e,o),i(o,l),i(l,r),i(e,c),h||(v=p(o,"click",g(k)),h=!0)},p(t,o){n=t,2&o[0]&&a!==(a=n[1]===n[0].label?"is-active":"")&&b(e,"class",a)},d(t){t&&u(e),h=!1,v()}}}function ht(t){let n,e,o={ctx:t,current:null,token:null,hasCatch:!0,pending:Ct,then:yt,catch:pt,value:30,error:33};return H(e=t[4].loadK8s(),o),{c(){n=h(),o.block.c()},m(t,e){s(t,n,e),o.block.m(t,o.anchor=e),o.mount=()=>n.parentNode,o.anchor=n},p(n,l){t=n,o.ctx=t,16&l[0]&&e!==(e=t[4].loadK8s())&&H(e,o)||O(o,t,l)},d(t){t&&u(n),o.block.d(t),o.token=null,o=null}}}function pt(t){let n,e;function o(t,n){return t[33]&&t[33].message?vt:"string"==typeof t[33]?bt:gt}let l=o(t),r=l(t);return{c(){n=d("div"),e=f(">\n            "),r.c(),b(n,"class","notification is-danger mt-2")},m(t,o){s(t,n,o),i(n,e),r.m(n,null)},p(t,e){l===(l=o(t))&&r?r.p(t,e):(r.d(1),r=l(t),r&&(r.c(),r.m(n,null)))},d(t){t&&u(n),r.d()}}}function gt(t){let n,e,o;return{c(){n=f("Failed to list "),e=f(t[1]),o=f(".")},m(t,l){s(t,n,l),s(t,e,l),s(t,o,l)},p(t,n){2&n[0]&&v(e,t[1])},d(t){t&&u(n),t&&u(e),t&&u(o)}}}function bt(t){let n,e=t[33]+"";return{c(){n=f(e)},m(t,e){s(t,n,e)},p(t,o){16&o[0]&&e!==(e=t[33]+"")&&v(n,e)},d(t){t&&u(n)}}}function vt(t){let n,e=t[33].message+"";return{c(){n=f(e)},m(t,e){s(t,n,e)},p(t,o){16&o[0]&&e!==(e=t[33].message+"")&&v(n,e)},d(t){t&&u(n)}}}function yt(t){let n;function e(t,n){return t[30].length?$t:kt}let o=e(t),l=o(t);return{c(){l.c(),n=h()},m(t,e){l.m(t,e),s(t,n,e)},p(t,r){o===(o=e(t))&&l?l.p(t,r):(l.d(1),l=o(t),l&&(l.c(),l.m(n.parentNode,n)))},d(t){l.d(t),t&&u(n)}}}function kt(n){let e;return{c(){e=d("p"),e.textContent="No Deployments was found on this profile.",y(e,"text-align","center"),b(e,"class","mt-2")},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function $t(t){let n,e,o,l,r,c=t[30],f=[];for(let n=0;n<c.length;n+=1)f[n]=_t(rt(t,c,n));return{c(){n=d("div"),e=d("table"),o=d("thead"),o.innerHTML='<tr><th title="position">#</th> \n                    <th>Name</th> \n                    <th>Public IP</th> \n                    <th>Planetary Network IP</th> \n                    <th>Workers</th> \n                    <th>Actions</th></tr>',l=m(),r=d("tbody");for(let t=0;t<f.length;t+=1)f[t].c();b(e,"class","table"),b(n,"class","table-container mt-2")},m(t,c){s(t,n,c),i(n,e),i(e,o),i(e,l),i(e,r);for(let t=0;t<f.length;t+=1)f[t].m(r,null)},p(t,n){if(8304&n[0]){let e;for(c=t[30],e=0;e<c.length;e+=1){const o=rt(t,c,e);f[e]?f[e].p(o,n):(f[e]=_t(o),f[e].c(),f[e].m(r,null))}for(;e<f.length;e+=1)f[e].d(1);f.length=c.length}},d(t){t&&u(n),a(f,t)}}}function wt(n){let e;return{c(){e=d("td"),e.textContent="-"},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function xt(t){let n,e,o=t[31].master.publicIP.ip+"";return{c(){n=d("td"),e=f(o)},m(t,o){s(t,n,o),i(n,e)},p(t,n){16&n[0]&&o!==(o=t[31].master.publicIP.ip+"")&&v(e,o)},d(t){t&&u(n)}}}function _t(t){let n,e,l,r,c,a,h,g,y,k,$,w,x,_,C,P,N,E,M,I,L,S,T,j,K,V,A=t[29]+1+"",D=t[31].name+"",H=t[31].master.yggIP+"",O=t[31].workers+"";function F(t,n){return t[31].master.publicIP?xt:wt}let B=F(t),R=B(t);function q(){return t[18](t[31])}function z(){return t[19](t[31])}return{c(){n=d("tr"),e=d("th"),l=f(A),r=m(),c=d("td"),a=f(D),h=m(),R.c(),g=m(),y=d("td"),k=f(H),$=m(),w=d("td"),x=f(O),_=m(),C=d("td"),P=d("button"),N=f("Show Details"),M=m(),I=d("button"),L=f("Delete"),j=m(),b(P,"class","button is-outlined is-primary ml-2"),P.disabled=E=t[5].includes(t[31].name),b(I,"class",S="button is-danger "+(t[5].includes(t[31].name)?"is-loading":"")),I.disabled=T=t[5].includes(t[31].name)},m(t,o){s(t,n,o),i(n,e),i(e,l),i(n,r),i(n,c),i(c,a),i(n,h),R.m(n,null),i(n,g),i(n,y),i(y,k),i(n,$),i(n,w),i(w,x),i(n,_),i(n,C),i(C,P),i(P,N),i(C,M),i(C,I),i(I,L),i(n,j),K||(V=[p(P,"click",q),p(I,"click",z)],K=!0)},p(e,o){t=e,16&o[0]&&D!==(D=t[31].name+"")&&v(a,D),B===(B=F(t))&&R?R.p(t,o):(R.d(1),R=B(t),R&&(R.c(),R.m(n,g))),16&o[0]&&H!==(H=t[31].master.yggIP+"")&&v(k,H),16&o[0]&&O!==(O=t[31].workers+"")&&v(x,O),48&o[0]&&E!==(E=t[5].includes(t[31].name))&&(P.disabled=E),48&o[0]&&S!==(S="button is-danger "+(t[5].includes(t[31].name)?"is-loading":""))&&b(I,"class",S),48&o[0]&&T!==(T=t[5].includes(t[31].name))&&(I.disabled=T)},d(t){t&&u(n),R.d(),K=!1,o(V)}}}function Ct(n){let e;return{c(){e=d("div"),e.textContent="> Loading...",b(e,"class","notification is-info mt-2")},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function Pt(t){let n,e,o={ctx:t,current:null,token:null,hasCatch:!0,pending:Dt,then:Lt,catch:Nt,value:30,error:33};return H(e="Caprover"===t[1]||"caprover"===t[0]?t[4].loadCaprover():t[4].loadVm(),o),{c(){n=h(),o.block.c()},m(t,e){s(t,n,e),o.block.m(t,o.anchor=e),o.mount=()=>n.parentNode,o.anchor=n},p(n,l){t=n,o.ctx=t,19&l[0]&&e!==(e="Caprover"===t[1]||"caprover"===t[0]?t[4].loadCaprover():t[4].loadVm())&&H(e,o)||O(o,t,l)},d(t){t&&u(n),o.block.d(t),o.token=null,o=null}}}function Nt(t){let n,e;function o(t,n){return t[33]&&t[33].message?It:"string"==typeof t[33]?Mt:Et}let l=o(t),r=l(t);return{c(){n=d("div"),e=f(">\n            "),r.c(),b(n,"class","notification is-danger mt-2")},m(t,o){s(t,n,o),i(n,e),r.m(n,null)},p(t,e){l===(l=o(t))&&r?r.p(t,e):(r.d(1),r=l(t),r&&(r.c(),r.m(n,null)))},d(t){t&&u(n),r.d()}}}function Et(t){let n,e,o;return{c(){n=f("Failed to list "),e=f(t[1]),o=f(".")},m(t,l){s(t,n,l),s(t,e,l),s(t,o,l)},p(t,n){2&n[0]&&v(e,t[1])},d(t){t&&u(n),t&&u(e),t&&u(o)}}}function Mt(t){let n,e=t[33]+"";return{c(){n=f(e)},m(t,e){s(t,n,e)},p(t,o){19&o[0]&&e!==(e=t[33]+"")&&v(n,e)},d(t){t&&u(n)}}}function It(t){let n,e=t[33].message+"";return{c(){n=f(e)},m(t,e){s(t,n,e)},p(t,o){19&o[0]&&e!==(e=t[33].message+"")&&v(n,e)},d(t){t&&u(n)}}}function Lt(t){let n;function e(t,n){return t[30].length?Tt:St}let o=e(t),l=o(t);return{c(){l.c(),n=h()},m(t,e){l.m(t,e),s(t,n,e)},p(t,r){o===(o=e(t))&&l?l.p(t,r):(l.d(1),l=o(t),l&&(l.c(),l.m(n.parentNode,n)))},d(t){l.d(t),t&&u(n)}}}function St(n){let e;return{c(){e=d("p"),e.textContent="No Deployments was found on this profile.",y(e,"text-align","center"),b(e,"class","mt-2")},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function Tt(t){let n,e,o,l,r,c=t[30],f=[];for(let n=0;n<c.length;n+=1)f[n]=At(lt(t,c,n));return{c(){n=d("div"),e=d("table"),o=d("thead"),o.innerHTML='<tr><th title="position">#</th> \n                    <th>Name</th> \n                    <th>Public IP</th> \n                    <th>Planetary Network IP</th> \n                    <th>Flist</th> \n                    <th>Actions</th></tr>',l=m(),r=d("tbody");for(let t=0;t<f.length;t+=1)f[t].c();b(e,"class","table"),b(n,"class","table-container mt-2")},m(t,c){s(t,n,c),i(n,e),i(e,o),i(e,l),i(e,r);for(let t=0;t<f.length;t+=1)f[t].m(r,null)},p(t,n){if(8307&n[0]){let e;for(c=t[30],e=0;e<c.length;e+=1){const o=lt(t,c,e);f[e]?f[e].p(o,n):(f[e]=At(o),f[e].c(),f[e].m(r,null))}for(;e<f.length;e+=1)f[e].d(1);f.length=c.length}},d(t){t&&u(n),a(f,t)}}}function jt(t){let n,e,l,r,c,a,h,g,y,k,$,w,x,_,C,P,N,E,M,I,L,S,T,j,K,V,A=t[29]+1+"",D=t[31].name+"",H=t[31].yggIP+"",O=t[31].flist+"";function F(t,n){return t[31].publicIP?Vt:Kt}let B=F(t),R=B(t);function q(){return t[20](t[31])}function z(){return t[21](t[31])}return{c(){n=d("tr"),e=d("th"),l=f(A),r=m(),c=d("td"),a=f(D),h=m(),R.c(),g=m(),y=d("td"),k=f(H),$=m(),w=d("td"),x=f(O),_=m(),C=d("td"),P=d("button"),N=f("Show Details"),M=m(),I=d("button"),L=f("Delete"),j=m(),b(P,"class","button is-outlined is-primary ml-2"),P.disabled=E=t[5].includes(t[31].name),b(I,"class",S="button is-danger "+(t[5].includes(t[31].name)?"is-loading":"")),I.disabled=T=t[5].includes(t[31].name)},m(t,o){s(t,n,o),i(n,e),i(e,l),i(n,r),i(n,c),i(c,a),i(n,h),R.m(n,null),i(n,g),i(n,y),i(y,k),i(n,$),i(n,w),i(w,x),i(n,_),i(n,C),i(C,P),i(P,N),i(C,M),i(C,I),i(I,L),i(n,j),K||(V=[p(P,"click",q),p(I,"click",z)],K=!0)},p(e,o){t=e,19&o[0]&&D!==(D=t[31].name+"")&&v(a,D),B===(B=F(t))&&R?R.p(t,o):(R.d(1),R=B(t),R&&(R.c(),R.m(n,g))),19&o[0]&&H!==(H=t[31].yggIP+"")&&v(k,H),19&o[0]&&O!==(O=t[31].flist+"")&&v(x,O),51&o[0]&&E!==(E=t[5].includes(t[31].name))&&(P.disabled=E),51&o[0]&&S!==(S="button is-danger "+(t[5].includes(t[31].name)?"is-loading":""))&&b(I,"class",S),51&o[0]&&T!==(T=t[5].includes(t[31].name))&&(I.disabled=T)},d(t){t&&u(n),R.d(),K=!1,o(V)}}}function Kt(n){let e;return{c(){e=d("td"),e.textContent="-"},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function Vt(t){let n,e,o=t[31].publicIP.ip+"";return{c(){n=d("td"),e=f(o)},m(t,o){s(t,n,o),i(n,e)},p(t,n){19&n[0]&&o!==(o=t[31].publicIP.ip+"")&&v(e,o)},d(t){t&&u(n)}}}function At(t){let n,e=t[31].name&&jt(t);return{c(){e&&e.c(),n=h()},m(t,o){e&&e.m(t,o),s(t,n,o)},p(t,o){t[31].name?e?e.p(t,o):(e=jt(t),e.c(),e.m(n.parentNode,n)):e&&(e.d(1),e=null)},d(t){e&&e.d(t),t&&u(n)}}}function Dt(n){let e;return{c(){e=d("div"),e.textContent="> Loading...",b(e,"class","notification is-info mt-2")},m(t,n){s(t,e,n)},p:t,d(t){t&&u(e)}}}function Ht(t){let n,e,o,l=t[29]+1+"";return{c(){n=f("Profile "),e=f(l),o=m()},m(t,l){s(t,n,l),s(t,e,l),s(t,o,l)},p(t,n){128&n[0]&&l!==(l=t[29]+1+"")&&v(e,l)},d(t){t&&u(n),t&&u(e),t&&u(o)}}}function Ot(t){let n,e,o=t[8].name+"";return{c(){n=f(o),e=m()},m(t,o){s(t,n,o),s(t,e,o)},p(t,e){128&e[0]&&o!==(o=t[8].name+"")&&v(n,o)},d(t){t&&u(n),t&&u(e)}}}function Ft(t,n){let e,o;function l(t,n){return t[8].name?Ot:Ht}let r=l(n),c=r(n);return{key:t,first:null,c(){e=d("option"),c.c(),e.__value=o=n[29],e.value=e.__value,this.first=e},m(t,n){s(t,e,n),c.m(e,null)},p(t,i){r===(r=l(n=t))&&c?c.p(n,i):(c.d(1),c=r(n),c&&(c.c(),c.m(e,null))),128&i[0]&&o!==(o=n[29])&&(e.__value=o,e.value=e.__value)},d(t){t&&u(e),c.d()}}}function Bt(t){let n,e,o,l,r,c,a,h,g,k;return{c(){n=d("div"),e=d("div"),o=m(),l=d("div"),r=d("div"),c=f(t[6]),a=m(),h=d("button"),b(e,"class","modal-background"),b(r,"class","box"),y(r,"white-space","pre"),b(l,"class","modal-content"),b(h,"class","modal-close is-large"),b(h,"aria-label","close"),b(n,"class","modal is-active")},m(u,d){s(u,n,d),i(n,e),i(n,o),i(n,l),i(l,r),i(r,c),i(n,a),i(n,h),g||(k=p(h,"click",t[22]),g=!0)},p(t,n){64&n[0]&&v(c,t[6])},d(t){t&&u(n),g=!1,k()}}}function Rt(n){let e,o,l,r,c,a,p,g,v,k=("k8s"===n[0]||"vm"===n[0]||"caprover"===n[0])&&st(n);function $(t,n){return t[2]?dt:t[3]?ut:at}let w=$(n),x=w(n),_=n[6]&&Bt(n);return{c(){e=d("div"),o=d("section"),l=d("h4"),r=f("Deployment List\n      "),k&&k.c(),c=m(),a=d("hr"),p=m(),x.c(),g=m(),_&&_.c(),v=h(),this.c=t,b(l,"class","is-size-4 mb-4"),b(o,"class","box"),y(e,"padding","15px")},m(t,n){s(t,e,n),i(e,o),i(o,l),i(l,r),k&&k.m(l,null),i(o,c),i(o,a),i(o,p),x.m(o,null),s(t,g,n),_&&_.m(t,n),s(t,v,n)},p(t,n){"k8s"===t[0]||"vm"===t[0]||"caprover"===t[0]?k?k.p(t,n):(k=st(t),k.c(),k.m(l,null)):k&&(k.d(1),k=null),w===(w=$(t))&&x?x.p(t,n):(x.d(1),x=w(t),x&&(x.c(),x.m(o,null))),t[6]?_?_.p(t,n):(_=Bt(t),_.c(),_.m(v.parentNode,v)):_&&(_.d(1),_=null)},i:t,o:t,d(t){t&&u(e),k&&k.d(),x.d(),t&&u(g),_&&_.d(t),t&&u(v)}}}function qt(t,n,e){let o,l,r;var i,s;let{tab:u}=n;let a,d="Kubernetes",f=!1,m=!1;const h=null===(i=window.configs)||void 0===i?void 0:i.baseConfig;c(t,h,(t=>e(15,r=t)));const p=null===(s=window.configs)||void 0===s?void 0:s.deploymentStore;let g=0;function b(){const t=d;e(1,d="");const n=u;e(0,u=void 0),requestAnimationFrame((()=>{e(1,d=t),e(0,u=n)}))}let v=[];function y(t,n){e(5,v=[...v,n]);const o=v.length-1;(function(t,n,e){const{mnemonics:o,networkEnv:l,storeSecret:r}=t,c=new ot(0,""),i=new et(l,o,r,c,void 0,"tfkvstore");return i.connect().then((()=>i[n].delete({name:e})))})(l,t,n).then((t=>{console.log("Removed",t),0===t.deleted.length&&(v.splice(o,1),e(5,v)),b()})).catch((t=>{console.log("Error while removing",t)}))}let k,$="";var w;w=()=>{k=p.subscribe((t=>{b()}))},x().$$.on_mount.push(w),function(t){x().$$.on_destroy.push(t)}((()=>{k()}));return t.$$set=t=>{"tab"in t&&e(0,u=t.tab)},t.$$.update=()=>{32768&t.$$.dirty[0]&&e(7,o=r),49152&t.$$.dirty[0]&&e(8,l=r[g])},[u,d,f,m,a,v,$,o,l,[{label:"Kubernetes"},{label:"Virtual Machines"},{label:"Caprover"}],h,function(){e(3,m=!0),e(2,f=!0),X.init(l).then((t=>{e(4,a=t)})).finally((()=>e(2,f=!1)))},t=>e(14,g=t.target.selectedIndex),y,g,r,()=>e(3,m=!1),t=>e(1,d=t.label),t=>{e(6,$=JSON.stringify(t.details,void 0,4))},t=>y("k8s",t.name),t=>{e(6,$=JSON.stringify(t,void 0,4))},t=>y("machines",t.name),()=>e(6,$="")]}customElements.define("tf-deployedlist",class extends A{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");.table{width:100%}</style>',q(this,{target:this.shadowRoot,props:k(this.attributes),customElement:!0},qt,Rt,r,{tab:0},null,[-1,-1]),t&&(t.target&&s(t.target,this,t.anchor),t.props&&(this.$set(t.props),T()))}static get observedAttributes(){return["tab"]}get tab(){return this.$$.ctx[0]}set tab(t){this.$$set({tab:t}),T()}})}();
