!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function l(t){t.forEach(e)}function o(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(e,n,l){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const l=e.subscribe(...n);return l.unsubscribe?()=>l.unsubscribe():l}(n,l))}function r(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function a(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function p(){return d(" ")}function f(){return d("")}function m(t,e,n,l){return t.addEventListener(e,n,l),()=>t.removeEventListener(e,n,l)}function h(t){return function(e){return e.preventDefault(),t.call(this,e)}}function b(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function y(t){return""===t?null:+t}function v(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function g(t,e){t.value=null==e?"":e}function w(t,e,n,l){t.style.setProperty(e,n,l?"important":"")}function k(t,e){for(let n=0;n<t.options.length;n+=1){const l=t.options[n];if(l.__value===e)return void(l.selected=!0)}t.selectedIndex=-1}function x(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function _(t){const e={};for(const n of t)e[n.name]=n.value;return e}let $;function C(t){$=t}const M=[],N=[],P=[],S=[],A=Promise.resolve();let E=!1;function I(t){P.push(t)}let F=!1;const V=new Set;function D(){if(!F){F=!0;do{for(let t=0;t<M.length;t+=1){const e=M[t];C(e),z(e.$$)}for(C(null),M.length=0;N.length;)N.pop()();for(let t=0;t<P.length;t+=1){const e=P[t];V.has(e)||(V.add(e),e())}P.length=0}while(M.length);for(;S.length;)S.pop()();E=!1,F=!1,V.clear()}}function z(t){if(null!==t.fragment){t.update(),l(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(I)}}const L=new Set;function O(t,e){t&&t.i&&(L.delete(t),t.i(e))}function U(t,e){t.d(1),e.delete(t.key)}function T(t,e,n,l,o,i,s,r,c,a,u,d){let p=t.length,f=i.length,m=p;const h={};for(;m--;)h[t[m].key]=m;const b=[],y=new Map,v=new Map;for(m=f;m--;){const t=d(o,i,m),r=n(t);let c=s.get(r);c?l&&c.p(t,e):(c=a(r,t),c.c()),y.set(r,b[m]=c),r in h&&v.set(r,Math.abs(m-h[r]))}const g=new Set,w=new Set;function k(t){O(t,1),t.m(r,u),s.set(t.key,t),u=t.first,f--}for(;p&&f;){const e=b[f-1],n=t[p-1],l=e.key,o=n.key;e===n?(u=e.first,p--,f--):y.has(o)?!s.has(l)||g.has(l)?k(e):w.has(o)?p--:v.get(l)>v.get(o)?(w.add(l),k(e)):(g.add(o),p--):(c(n,s),p--)}for(;p--;){const e=t[p];y.has(e.key)||c(e,s)}for(;f;)k(b[f-1]);return b}function j(t,e){-1===t.$$.dirty[0]&&(M.push(t),E||(E=!0,A.then(D)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function R(i,s,r,c,u,d,p,f=[-1]){const m=$;C(i);const h=i.$$={fragment:null,ctx:null,props:d,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(s.context||(m?m.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:s.target||m.$$.root};p&&p(h.root);let b=!1;if(h.ctx=r?r(i,s.props||{},((t,e,...n)=>{const l=n.length?n[0]:e;return h.ctx&&u(h.ctx[t],h.ctx[t]=l)&&(!h.skip_bound&&h.bound[t]&&h.bound[t](l),b&&j(i,t)),e})):[],h.update(),b=!0,l(h.before_update),h.fragment=!!c&&c(h.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);h.fragment&&h.fragment.l(t),t.forEach(a)}else h.fragment&&h.fragment.c();s.intro&&O(i.$$.fragment),function(t,n,i,s){const{fragment:r,on_mount:c,on_destroy:a,after_update:u}=t.$$;r&&r.m(n,i),s||I((()=>{const n=c.map(e).filter(o);a?a.push(...n):l(n),t.$$.on_mount=[]})),u.forEach(I)}(i,s.target,s.anchor,s.customElement),D()}C(m)}let H;var Y;"function"==typeof HTMLElement&&(H=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(e).filter(o);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}disconnectedCallback(){l(this.$$.on_disconnect)}$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});var B=new Uint8Array(16);function K(){if(!Y&&!(Y="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return Y(B)}var q=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function G(t){return"string"==typeof t&&q.test(t)}for(var J,W,X=[],Q=0;Q<256;++Q)X.push((Q+256).toString(16).substr(1));function Z(t,e,n){var l=(t=t||{}).random||(t.rng||K)();if(l[6]=15&l[6]|64,l[8]=63&l[8]|128,e){n=n||0;for(var o=0;o<16;++o)e[n+o]=l[o];return e}return function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=(X[t[e+0]]+X[t[e+1]]+X[t[e+2]]+X[t[e+3]]+"-"+X[t[e+4]]+X[t[e+5]]+"-"+X[t[e+6]]+X[t[e+7]]+"-"+X[t[e+8]]+X[t[e+9]]+"-"+X[t[e+10]]+X[t[e+11]]+X[t[e+12]]+X[t[e+13]]+X[t[e+14]]+X[t[e+15]]).toLowerCase();if(!G(n))throw TypeError("Stringified UUID is invalid");return n}(l)}function tt(t){const e=+t;return"number"==typeof e&&!isNaN(e)&&e>=0&&e.toFixed(0)===e.toString()}class et{constructor(t="nw_"+Z().split("-")[0],e="10.20.0.0/16"){this.name=t,this.ipRange=e}get valid(){const{name:t,ipRange:e}=this;return""!==t&&""!==e}}class nt{constructor(t=Z(),e="SSH_KEY",n="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDTwULSsUubOq3VPWL6cdrDvexDmjfznGydFPyaNcn7gAL9lRxwFbCDPMj7MbhNSpxxHV2+/iJPQOTVJu4oc1N7bPP3gBCnF51rPrhTpGCt5pBbTzeyNweanhedkKDsCO2mIEh/92Od5Hg512dX4j7Zw6ipRWYSaepapfyoRnNSriW/s3DH/uewezVtL5EuypMdfNngV/u2KZYWoeiwhrY/yEUykQVUwDysW/xUJNP5o+KSTAvNSJatr3FbuCFuCjBSvageOLHePTeUwu6qjqe+Xs4piF1ByO/6cOJ8bt5Vcx0bAtI8/MPApplUU/JWevsPNApvnA/ntffI+u8DCwgP"){this.id=t,this.key=e,this.value=n}get valid(){const{key:t,value:e}=this;return""!==t&&""!==e}}class lt{constructor(t=Z(),e="disk_"+t.split("-")[0],n=50,l="/opt/"){this.id=t,this.name=e,this.size=n,this.mountpoint=l}get valid(){const{name:t,size:e,mountpoint:n}=this;return""!==t&&tt(e)&&""!==n}}class ot{constructor(t=Z(),e="vm_"+t.split("-")[0],n="https://hub.grid.tf/tf-official-apps/base:latest.flist",l=4,o=8192,i="/sbin/zinit init",s=!0,r,c=25,a=new et,u=[],d=[],p=!1){this.id=t,this.name=e,this.flist=n,this.cpu=l,this.memory=o,this.entrypoint=i,this.planetary=s,this.nodeId=r,this.rootFsSize=c,this.network=a,this.envs=u,this.disks=d,this.publicIp=p}get valid(){const{name:t,flist:e,cpu:n,memory:l,entrypoint:o,nodeId:i}=this,{rootFsSize:s,network:r,envs:c,disks:a}=this;return""!==t&&""!==e&&""!==o&&tt(n)&&tt(l)&&tt(i)&&tt(s)&&r.valid&&c.reduce(((t,e)=>t&&e.valid),!0)&&a.reduce(((t,e)=>t&&e.valid),!0)}}
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
    ***************************************************************************** */const{NetworkModel:it}=null!==(W=null===(J=window.configs)||void 0===J?void 0:J.grid3_client)&&void 0!==W?W:{};var st,rt,ct,at;const{HTTPMessageBusClient:ut}=null!==(rt=null===(st=window.configs)||void 0===st?void 0:st.client)&&void 0!==rt?rt:{},{DiskModel:dt,MachineModel:pt,MachinesModel:ft,GridClient:mt}=null!==(at=null===(ct=window.configs)||void 0===ct?void 0:ct.grid3_client)&&void 0!==at?at:{};async function ht(t,e){const{envs:n,disks:l}=t,o=function(t,e){var n={};for(var l in t)Object.prototype.hasOwnProperty.call(t,l)&&e.indexOf(l)<0&&(n[l]=t[l]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(l=Object.getOwnPropertySymbols(t);o<l.length;o++)e.indexOf(l[o])<0&&Object.prototype.propertyIsEnumerable.call(t,l[o])&&(n[l[o]]=t[l[o]])}return n}(t,["envs","disks"]),{name:i,flist:s,cpu:r,memory:c,entrypoint:a,network:u}=o,{publicIp:d,planetary:p,nodeId:f,rootFsSize:m}=o,{mnemonics:h,storeSecret:b,networkEnv:y}=e,v=new ut(0,""),g=new mt(y,h,b,v,void 0,"tfkvstore"),w=new pt;w.name=i,w.node_id=f,w.disks=l.map(bt),w.public_ip=d,w.planetary=p,w.cpu=r,w.memory=c,w.rootfs_size=m,w.flist=s,w.entrypoint=a,w.env=function(t){return t.reduce(((t,e)=>(t[e.key]=e.value,t)),{})}(n);const k=new ft;return k.name=i,k.network=function(t){const e=new it;return e.name=t.name,e.ip_range=t.ipRange,e}(u),k.machines=[w],g.connect().then((()=>g.machines.deploy(k)))}function bt({name:t,size:e,mountpoint:n}){const l=new dt;return l.name=t,l.size=e,l.mountpoint=n,l}var yt,vt;const{GridClient:gt,Nodes:wt}=null!==(vt=null===(yt=window.configs)||void 0===yt?void 0:yt.grid3_client)&&void 0!==vt?vt:{};function kt(t,e,n){const l=t.slice();return l[53]=e[n],l[54]=e,l[55]=n,l}function xt(t,e,n){const l=t.slice();return l[56]=e[n],l[57]=e,l[58]=n,l}function _t(t,e,n){const l=t.slice();return l[59]=e[n],l[60]=e,l[55]=n,l}function $t(t,e,n){const l=t.slice();return l[56]=e[n],l[61]=e,l[62]=n,l}function Ct(t,e,n){const l=t.slice();return l[63]=e[n],l}function Mt(t,e,n){const l=t.slice();return l[56]=e[n],l[66]=e,l[67]=n,l}function Nt(t,e,n){const l=t.slice();return l[56]=e[n],l[68]=e,l[69]=n,l}function Pt(t,e,n){const l=t.slice();return l[56]=e[n],l[70]=e,l[71]=n,l}function St(t,e,n){const l=t.slice();return l[72]=e[n],l[74]=n,l}function At(t,e,n){const l=t.slice();return l[75]=e[n],l}function Et(t,e,n){const l=t.slice();return l[12]=e[n],l[74]=n,l}function It(t){let e,n,l,o,i,s,d,h,y,v,g,k=[],x=new Map,_=[],$=new Map,C=t[11];const M=t=>t[74];for(let e=0;e<C.length;e+=1){let n=Et(t,C,e),l=M(n);x.set(l,k[e]=Ot(l,n))}let N=t[14];const P=t=>t[75].label;for(let e=0;e<N.length;e+=1){let n=At(t,N,e),l=P(n);$.set(l,_[e]=Ut(l,n))}let S="Config"===t[0]&&Tt(t),A="Environment Variables"===t[0]&&te(t),E="Disks"===t[0]&&le(t);return{c(){e=u("div"),n=u("select");for(let t=0;t<k.length;t+=1)k[t].c();l=p(),o=u("div"),i=u("ul");for(let t=0;t<_.length;t+=1)_[t].c();s=p(),S&&S.c(),d=p(),A&&A.c(),h=p(),E&&E.c(),y=f(),b(e,"class","select mb-4"),w(e,"display","flex"),w(e,"justify-content","flex-end"),b(o,"class","tabs is-centered")},m(a,u){c(a,e,u),r(e,n);for(let t=0;t<k.length;t+=1)k[t].m(n,null);c(a,l,u),c(a,o,u),r(o,i);for(let t=0;t<_.length;t+=1)_[t].m(i,null);c(a,s,u),S&&S.m(a,u),c(a,d,u),A&&A.m(a,u),c(a,h,u),E&&E.m(a,u),c(a,y,u),v||(g=m(n,"change",t[22]),v=!0)},p(t,e){2048&e[0]&&(C=t[11],k=T(k,e,M,1,t,C,x,n,U,Ot,null,Et)),16385&e[0]&&(N=t[14],_=T(_,e,P,1,t,N,$,i,U,Ut,null,At)),"Config"===t[0]?S?S.p(t,e):(S=Tt(t),S.c(),S.m(d.parentNode,d)):S&&(S.d(1),S=null),"Environment Variables"===t[0]?A?A.p(t,e):(A=te(t),A.c(),A.m(h.parentNode,h)):A&&(A.d(1),A=null),"Disks"===t[0]?E?E.p(t,e):(E=le(t),E.c(),E.m(y.parentNode,y)):E&&(E.d(1),E=null)},d(t){t&&a(e);for(let t=0;t<k.length;t+=1)k[t].d();t&&a(l),t&&a(o);for(let t=0;t<_.length;t+=1)_[t].d();t&&a(s),S&&S.d(t),t&&a(d),A&&A.d(t),t&&a(h),E&&E.d(t),t&&a(y),v=!1,g()}}}function Ft(t){let e,n;function l(t,e){return t[5]?re:se}let o=l(t),i=o(t);return{c(){e=u("div"),n=d(">\n        "),i.c(),b(e,"class","notification is-danger")},m(t,l){c(t,e,l),r(e,n),i.m(e,null)},p(t,n){o===(o=l(t))&&i?i.p(t,n):(i.d(1),i=o(t),i&&(i.c(),i.m(e,null)))},d(t){t&&a(e),i.d()}}}function Vt(e){let n;return{c(){n=u("div"),n.textContent="> Successfully deployed VM.",b(n,"class","notification is-success")},m(t,e){c(t,n,e)},p:t,d(t){t&&a(n)}}}function Dt(t){let e;function n(t,e){return t[5]?ae:ce}let l=n(t),o=l(t);return{c(){e=u("div"),o.c(),b(e,"class","notification is-info")},m(t,n){c(t,e,n),o.m(e,null)},p(t,i){l===(l=n(t))&&o?o.p(t,i):(o.d(1),o=l(t),o&&(o.c(),o.m(e,null)))},d(t){t&&a(e),o.d()}}}function zt(t){let e,n,l,o=t[74]+1+"";return{c(){e=d("Profile "),n=d(o),l=p()},m(t,o){c(t,e,o),c(t,n,o),c(t,l,o)},p(t,e){2048&e[0]&&o!==(o=t[74]+1+"")&&v(n,o)},d(t){t&&a(e),t&&a(n),t&&a(l)}}}function Lt(t){let e,n,l=t[12].name+"";return{c(){e=d(l),n=p()},m(t,l){c(t,e,l),c(t,n,l)},p(t,n){2048&n[0]&&l!==(l=t[12].name+"")&&v(e,l)},d(t){t&&a(e),t&&a(n)}}}function Ot(t,e){let n,l;function o(t,e){return t[12].name?Lt:zt}let i=o(e),s=i(e);return{key:t,first:null,c(){n=u("option"),s.c(),n.__value=l=e[74],n.value=n.__value,this.first=n},m(t,e){c(t,n,e),s.m(n,null)},p(t,r){i===(i=o(e=t))&&s?s.p(e,r):(s.d(1),s=i(e),s&&(s.c(),s.m(n,null))),2048&r[0]&&l!==(l=e[74])&&(n.__value=l,n.value=n.__value)},d(t){t&&a(n),s.d()}}}function Ut(t,e){let n,l,o,i,s,f,y,v,g=e[75].label+"";function w(){return e[27](e[75])}return{key:t,first:null,c(){n=u("li"),l=u("a"),o=u("span"),i=d(g),s=p(),b(l,"href","#!"),b(n,"class",f=e[0]===e[75].label?"is-active":""),this.first=n},m(t,e){c(t,n,e),r(n,l),r(l,o),r(o,i),r(n,s),y||(v=m(l,"click",h(w)),y=!0)},p(t,l){e=t,1&l[0]&&f!==(f=e[0]===e[75].label?"is-active":"")&&b(n,"class",f)},d(t){t&&a(n),y=!1,v()}}}function Tt(t){let e,n,o,i,s,d,h,y,v,x,_,$,C,M,N,P,S,A,E,F,V,D,z,L,O=[],j=new Map,R=[],H=new Map,Y=t[20];const B=t=>t[72].url;for(let e=0;e<Y.length;e+=1){let n=St(t,Y,e),l=B(n);j.set(l,O[e]=jt(l,n))}let K="other"===t[6]&&Rt(t),q=t[15];const G=t=>t[56].symbol;for(let e=0;e<q.length;e+=1){let n=Nt(t,q,e),l=G(n);H.set(l,R[e]=qt(l,n))}function J(t,e){return"automatic"===t[8]?Jt:"manual"===t[8]?Gt:void 0}let W=J(t),X=W&&W(t);return{c(){e=u("div"),n=u("p"),n.textContent="Name",o=p(),i=u("div"),s=u("input"),d=p(),h=u("p"),h.textContent="Flists",y=p(),v=u("div"),x=u("select"),_=u("option"),_.textContent="Please select a flist";for(let t=0;t<O.length;t+=1)O[t].c();$=u("option"),$.textContent="Other",C=p(),K&&K.c(),M=p();for(let t=0;t<R.length;t+=1)R[t].c();N=p(),P=u("div"),S=u("select"),A=u("option"),A.textContent="Choose a way to select node",E=u("option"),E.textContent="Automatic",F=u("option"),F.textContent="Manual",V=p(),X&&X.c(),D=f(),b(n,"class","label"),b(s,"class","input"),b(s,"type","text"),b(s,"placeholder","Virtual Machine Name"),b(i,"class","control"),b(e,"class","field"),b(h,"class","label"),_.selected=!0,_.disabled=!0,_.__value="Please select a flist",_.value=_.__value,$.__value="other",$.value=$.__value,w(x,"width","100%"),void 0===t[6]&&I((()=>t[29].call(x))),b(v,"class","select mb-2"),w(v,"width","100%"),A.selected=!0,A.disabled=!0,A.__value="Choose a way to select node",A.value=A.__value,E.__value="automatic",E.value=E.__value,F.__value="manual",F.value=F.__value,void 0===t[8]&&I((()=>t[34].call(S))),b(P,"class","select mb-2")},m(l,a){c(l,e,a),r(e,n),r(e,o),r(e,i),r(i,s),g(s,t[4].name),c(l,d,a),c(l,h,a),c(l,y,a),c(l,v,a),r(v,x),r(x,_);for(let t=0;t<O.length;t+=1)O[t].m(x,null);r(x,$),k(x,t[6]),c(l,C,a),K&&K.m(l,a),c(l,M,a);for(let t=0;t<R.length;t+=1)R[t].m(l,a);c(l,N,a),c(l,P,a),r(P,S),r(S,A),r(S,E),r(S,F),k(S,t[8]),c(l,V,a),X&&X.m(l,a),c(l,D,a),z||(L=[m(s,"input",t[28]),m(x,"change",t[29]),m(x,"change",t[21]),m(S,"change",t[34])],z=!0)},p(t,e){1552&e[0]&&s.value!==t[4].name&&g(s,t[4].name),1048576&e[0]&&(Y=t[20],O=T(O,e,B,1,t,Y,j,x,U,jt,$,St)),1048640&e[0]&&k(x,t[6]),"other"===t[6]?K?K.p(t,e):(K=Rt(t),K.c(),K.m(M.parentNode,M)):K&&(K.d(1),K=null),32784&e[0]&&(q=t[15],R=T(R,e,G,1,t,q,H,N.parentNode,U,qt,N,Nt)),256&e[0]&&k(S,t[8]),W===(W=J(t))&&X?X.p(t,e):(X&&X.d(1),X=W&&W(t),X&&(X.c(),X.m(D.parentNode,D)))},d(t){t&&a(e),t&&a(d),t&&a(h),t&&a(y),t&&a(v);for(let t=0;t<O.length;t+=1)O[t].d();t&&a(C),K&&K.d(t),t&&a(M);for(let e=0;e<R.length;e+=1)R[e].d(t);t&&a(N),t&&a(P),t&&a(V),X&&X.d(t),t&&a(D),z=!1,l(L)}}}function jt(t,e){let n,l,o,i=e[72].name+"";return{key:t,first:null,c(){n=u("option"),l=d(i),n.__value=o=e[74],n.value=n.__value,this.first=n},m(t,e){c(t,n,e),r(n,l)},p(t,n){e=t},d(t){t&&a(n)}}}function Rt(t){let e,n=[],l=new Map,o=t[16];const i=t=>t[56].symbol;for(let e=0;e<o.length;e+=1){let s=Pt(t,o,e),r=i(s);l.set(r,n[e]=Ht(r,s))}return{c(){for(let t=0;t<n.length;t+=1)n[t].c();e=f()},m(t,l){for(let e=0;e<n.length;e+=1)n[e].m(t,l);c(t,e,l)},p(t,s){65552&s[0]&&(o=t[16],n=T(n,s,i,1,t,o,l,e.parentNode,U,Ht,e,Pt))},d(t){for(let e=0;e<n.length;e+=1)n[e].d(t);t&&a(e)}}}function Ht(t,e){let n,l,o,i,s,f,h,y,v,w,k=e[56].label+"";function x(){e[30].call(f,e[56])}return{key:t,first:null,c(){n=u("div"),l=u("p"),o=d(k),i=p(),s=u("div"),f=u("input"),y=p(),b(l,"class","label"),b(f,"class","input"),b(f,"type","text"),b(f,"placeholder",h=e[56].placeholder),b(s,"class","control"),b(n,"class","field"),this.first=n},m(t,a){c(t,n,a),r(n,l),r(l,o),r(n,i),r(n,s),r(s,f),g(f,e[4][e[56].symbol]),r(n,y),v||(w=m(f,"input",x),v=!0)},p(t,n){e=t,67088&n[0]&&f.value!==e[4][e[56].symbol]&&g(f,e[4][e[56].symbol])},d(t){t&&a(n),v=!1,w()}}}function Yt(t){let e,n,l;function o(){t[33].call(e,t[56])}return{c(){e=u("input"),b(e,"class","input"),b(e,"type","text"),b(e,"placeholder",t[56].placeholder)},m(i,s){c(i,e,s),g(e,t[4][t[56].symbol]),n||(l=m(e,"input",o),n=!0)},p(n,l){t=n,34320&l[0]&&e.value!==t[4][t[56].symbol]&&g(e,t[4][t[56].symbol])},d(t){t&&a(e),n=!1,l()}}}function Bt(t){let e,n,l,o,i,s,f,h=t[56].label+"";function y(){return t[32](t[56])}return{c(){e=u("label"),n=u("input"),o=p(),i=d(h),b(n,"type","checkbox"),n.checked=l=t[4][t[56].symbol],b(e,"class","checkbox")},m(t,l){c(t,e,l),r(e,n),r(e,o),r(e,i),s||(f=m(n,"change",y),s=!0)},p(e,o){t=e,1552&o[0]&&l!==(l=t[4][t[56].symbol])&&(n.checked=l)},d(t){t&&a(e),s=!1,f()}}}function Kt(t){let e,n,l;function o(){t[31].call(e,t[56])}return{c(){e=u("input"),b(e,"class","input"),b(e,"type","number"),b(e,"placeholder",t[56].placeholder)},m(i,s){c(i,e,s),g(e,t[4][t[56].symbol]),n||(l=m(e,"input",o),n=!0)},p(n,l){t=n,34320&l[0]&&y(e.value)!==t[4][t[56].symbol]&&g(e,t[4][t[56].symbol])},d(t){t&&a(e),n=!1,l()}}}function qt(e,n){let l,o,i,s,f,m,h=n[56].label+"",y=n[56].link&&function(e){let n,l,o,i,s,p=e[56].link.label+"";return{c(){n=d("("),l=u("a"),o=d(p),s=d(")"),b(l,"href",i=e[56].link.url),b(l,"target","_blank")},m(t,e){c(t,n,e),c(t,l,e),r(l,o),c(t,s,e)},p:t,d(t){t&&a(n),t&&a(l),t&&a(s)}}}(n);let v=function(t,e){return"number"===t[56].type?Kt:"checkbox"===t[56].type?Bt:Yt}(n),g=v(n);return{key:e,first:null,c(){l=u("div"),o=u("p"),i=d(h),s=p(),y&&y.c(),f=p(),m=u("div"),g.c(),b(o,"class","label"),b(m,"class","control"),b(l,"class","field"),this.first=l},m(t,e){c(t,l,e),r(l,o),r(o,i),r(o,s),y&&y.m(o,null),r(l,f),r(l,m),g.m(m,null)},p(t,e){(n=t)[56].link&&y.p(n,e),g.p(n,e)},d(t){t&&a(l),y&&y.d(),g.d()}}}function Gt(t){let e,n,l,o,i,s,d;return{c(){e=u("div"),n=u("p"),n.textContent="Node ID",l=p(),o=u("div"),i=u("input"),b(n,"class","label"),b(i,"class","input"),b(i,"type","number"),b(i,"placeholder","Your Node ID"),b(o,"class","control"),b(e,"class","field")},m(a,u){c(a,e,u),r(e,n),r(e,l),r(e,o),r(o,i),g(i,t[4].nodeId),s||(d=m(i,"input",t[39]),s=!0)},p(t,e){1552&e[0]&&y(i.value)!==t[4].nodeId&&g(i,t[4].nodeId)},d(t){t&&a(e),s=!1,d()}}}function Jt(t){let e,n,o,i,s,f,h,y,v,g,x,_,$,C,M,N=[],P=new Map,S=[],A=new Map,E=t[23];const F=t=>t[56].symbol;for(let e=0;e<E.length;e+=1){let n=Mt(t,E,e),l=F(n);P.set(l,N[e]=Wt(l,n))}function V(t,e){return t[10]?Qt:Xt}let D=V(t),z=D(t),L=t[9];const O=t=>t[63];for(let e=0;e<L.length;e+=1){let n=Ct(t,L,e),l=O(n);A.set(l,S[e]=Zt(l,n))}return{c(){e=u("section"),n=u("h5"),n.textContent="Nodes Filter",o=p();for(let t=0;t<N.length;t+=1)N[t].c();i=p(),s=u("button"),f=d("Apply Filters"),y=p(),v=u("div"),g=u("select"),x=u("option"),z.c(),_=p();for(let t=0;t<S.length;t+=1)S[t].c();b(n,"class","is-size-3 has-text-weight-bold"),b(s,"class",h="button is-primary mt-2 "+(t[10]?"is-loading":"")),s.disabled=t[10],b(s,"type","button"),x.selected=!0,x.disabled=!0,x.__value=$="\n                  "+t[10]+"\n                ",x.value=x.__value,void 0===t[4].nodeId&&I((()=>t[38].call(g))),b(v,"class","select mt-4"),w(e,"width","50%")},m(l,a){c(l,e,a),r(e,n),r(e,o);for(let t=0;t<N.length;t+=1)N[t].m(e,null);r(e,i),r(e,s),r(s,f),r(e,y),r(e,v),r(v,g),r(g,x),z.m(x,null),r(x,_);for(let t=0;t<S.length;t+=1)S[t].m(g,null);k(g,t[4].nodeId),C||(M=[m(s,"click",t[24]),m(g,"change",t[38])],C=!0)},p(t,n){8388736&n[0]&&(E=t[23],N=T(N,n,F,1,t,E,P,e,U,Wt,i,Mt)),1024&n[0]&&h!==(h="button is-primary mt-2 "+(t[10]?"is-loading":""))&&b(s,"class",h),1024&n[0]&&(s.disabled=t[10]),D!==(D=V(t))&&(z.d(1),z=D(t),z&&(z.c(),z.m(x,_))),1024&n[0]&&$!==($="\n                  "+t[10]+"\n                ")&&(x.__value=$,x.value=x.__value),512&n[0]&&(L=t[9],S=T(S,n,O,1,t,L,A,g,U,Zt,null,Ct)),1552&n[0]&&k(g,t[4].nodeId)},d(t){t&&a(e);for(let t=0;t<N.length;t+=1)N[t].d();z.d();for(let t=0;t<S.length;t+=1)S[t].d();C=!1,l(M)}}}function Wt(t,e){let n,l,o,i,s="checkbox"===e[56].type&&function(t){let e,n,l,o,i,s,f,h,y,v,g,k,x=t[56].label+"";function _(){t[35].call(l,t[56])}return{c(){e=u("div"),n=u("label"),l=u("input"),i=p(),s=u("span"),f=p(),h=u("label"),y=d(x),b(l,"type","checkbox"),b(l,"id",o=t[56].symbol),b(s,"class","slider"),b(n,"class","switch"),b(h,"for",v=t[56].symbol),b(h,"class","label ml-2"),w(h,"cursor","pointer"),w(e,"display","flex"),w(e,"align-items","center"),b(e,"class","mb-2")},m(o,a){c(o,e,a),r(e,n),r(n,l),l.checked=t[7][t[56].symbol],r(n,i),r(n,s),r(e,f),r(e,h),r(h,y),g||(k=m(l,"change",_),g=!0)},p(e,n){t=e,8388736&n[0]&&(l.checked=t[7][t[56].symbol])},d(t){t&&a(e),g=!1,k()}}}(e),h="text"===e[56].type&&function(t){let e,n,l,o,i,s,f,h,y,v=t[56].label+"";function w(){t[36].call(s,t[56])}return{c(){e=u("div"),n=u("p"),l=d(v),o=p(),i=u("div"),s=u("input"),b(n,"class","label"),b(s,"class","input"),b(s,"type","text"),b(s,"placeholder",f=t[56].label),b(i,"class","control"),b(e,"class","field")},m(a,u){c(a,e,u),r(e,n),r(n,l),r(e,o),r(e,i),r(i,s),g(s,t[7][t[56].symbol]),h||(y=m(s,"input",w),h=!0)},p(e,n){t=e,8388736&n[0]&&s.value!==t[7][t[56].symbol]&&g(s,t[7][t[56].symbol])},d(t){t&&a(e),h=!1,y()}}}(e),v="number"===e[56].type&&function(t){let e,n,l,o,i,s,f,h,v,w=t[56].label+"";function k(){t[37].call(s,t[56])}return{c(){e=u("div"),n=u("p"),l=d(w),o=p(),i=u("div"),s=u("input"),b(n,"class","label"),b(s,"class","input"),b(s,"type","number"),b(s,"placeholder",f=t[56].label),b(i,"class","control"),b(e,"class","field")},m(a,u){c(a,e,u),r(e,n),r(n,l),r(e,o),r(e,i),r(i,s),g(s,t[7][t[56].symbol]),h||(v=m(s,"input",k),h=!0)},p(e,n){t=e,8388736&n[0]&&y(s.value)!==t[7][t[56].symbol]&&g(s,t[7][t[56].symbol])},d(t){t&&a(e),h=!1,v()}}}(e);return{key:t,first:null,c(){n=f(),s&&s.c(),l=p(),h&&h.c(),o=p(),v&&v.c(),i=f(),this.first=n},m(t,e){c(t,n,e),s&&s.m(t,e),c(t,l,e),h&&h.m(t,e),c(t,o,e),v&&v.m(t,e),c(t,i,e)},p(t,n){"checkbox"===(e=t)[56].type&&s.p(e,n),"text"===e[56].type&&h.p(e,n),"number"===e[56].type&&v.p(e,n)},d(t){t&&a(n),s&&s.d(t),t&&a(l),h&&h.d(t),t&&a(o),v&&v.d(t),t&&a(i)}}}function Xt(t){let e;return{c(){e=d("Please select a node ID")},m(t,n){c(t,e,n)},d(t){t&&a(e)}}}function Qt(t){let e;return{c(){e=d("Loading...")},m(t,n){c(t,e,n)},d(t){t&&a(e)}}}function Zt(t,e){let n,l,o,i,s=e[63]+"";return{key:t,first:null,c(){n=u("option"),l=d(s),o=p(),n.__value=i=e[63],n.value=n.__value,this.first=n},m(t,e){c(t,n,e),r(n,l),r(n,o)},p(t,o){e=t,512&o[0]&&s!==(s=e[63]+"")&&v(l,s),512&o[0]&&i!==(i=e[63])&&(n.__value=i,n.value=n.__value)},d(t){t&&a(n)}}}function te(t){let e,n,l,o,i,s,d=[],f=new Map,h=t[4].envs;const y=t=>t[59].id;for(let e=0;e<h.length;e+=1){let n=_t(t,h,e),l=y(n);f.set(l,d[e]=ne(l,n))}return{c(){e=u("div"),n=u("button"),n.innerHTML="<span>+</span>",l=p(),o=u("div");for(let t=0;t<d.length;t+=1)d[t].c();b(n,"type","button"),b(n,"class","button is-primary"),b(e,"class","actions"),w(e,"margin-bottom","20px"),b(o,"class","vm-container")},m(a,u){c(a,e,u),r(e,n),c(a,l,u),c(a,o,u);for(let t=0;t<d.length;t+=1)d[t].m(o,null);i||(s=m(n,"click",t[40]),i=!0)},p(t,e){131088&e[0]&&(h=t[4].envs,d=T(d,e,y,1,t,h,f,o,U,ne,null,_t))},d(t){t&&a(e),t&&a(l),t&&a(o);for(let t=0;t<d.length;t+=1)d[t].d();i=!1,s()}}}function ee(t,e){let n,l,o,i,s,f,h,y,v=e[56].label+"";function w(){e[42].call(f,e[56],e[60],e[55])}return{key:t,first:null,c(){n=u("div"),l=u("p"),o=d(v),i=p(),s=u("div"),f=u("input"),b(l,"class","label"),b(f,"class","input"),b(f,"type","text"),b(f,"placeholder",e[56].placeholder),b(s,"class","control"),b(n,"class","field"),this.first=n},m(t,a){c(t,n,a),r(n,l),r(l,o),r(n,i),r(n,s),r(s,f),g(f,e[59][e[56].symbol]),h||(y=m(f,"input",w),h=!0)},p(t,n){e=t,132624&n[0]&&f.value!==e[59][e[56].symbol]&&g(f,e[59][e[56].symbol])},d(t){t&&a(n),h=!1,y()}}}function ne(t,e){let n,l,o,i,s,f,h,y,g,w,k=e[59].key+"",x=[],_=new Map;function $(){return e[41](e[55])}let C=e[17];const M=t=>t[56].symbol;for(let t=0;t<C.length;t+=1){let n=$t(e,C,t),l=M(n);_.set(l,x[t]=ee(l,n))}return{key:t,first:null,c(){n=u("div"),l=u("div"),o=u("p"),i=d(k),s=p(),f=u("button"),f.innerHTML="<span>-</span>",h=p();for(let t=0;t<x.length;t+=1)x[t].c();y=p(),b(o,"class","is-size-5 has-text-weight-bold"),b(f,"type","button"),b(f,"class","button is-danger"),b(l,"class","vm-header"),b(n,"class","box"),this.first=n},m(t,e){c(t,n,e),r(n,l),r(l,o),r(o,i),r(l,s),r(l,f),r(n,h);for(let t=0;t<x.length;t+=1)x[t].m(n,null);r(n,y),g||(w=m(f,"click",$),g=!0)},p(t,l){e=t,16&l[0]&&k!==(k=e[59].key+"")&&v(i,k),131088&l[0]&&(C=e[17],x=T(x,l,M,1,e,C,_,n,U,ee,y,$t))},d(t){t&&a(n);for(let t=0;t<x.length;t+=1)x[t].d();g=!1,w()}}}function le(t){let e,n,l,o,i,s,d=[],f=new Map,h=t[4].disks;const y=t=>t[53].id;for(let e=0;e<h.length;e+=1){let n=kt(t,h,e),l=y(n);f.set(l,d[e]=ie(l,n))}return{c(){e=u("div"),n=u("button"),n.innerHTML="<span>+</span>",l=p(),o=u("div");for(let t=0;t<d.length;t+=1)d[t].c();b(n,"type","button"),b(n,"class","button is-primary"),b(e,"class","actions"),w(e,"margin-bottom","20px"),b(o,"class","vm-container")},m(a,u){c(a,e,u),r(e,n),c(a,l,u),c(a,o,u);for(let t=0;t<d.length;t+=1)d[t].m(o,null);i||(s=m(n,"click",t[43]),i=!0)},p(t,e){262160&e[0]&&(h=t[4].disks,d=T(d,e,y,1,t,h,f,o,U,ie,null,kt))},d(t){t&&a(e),t&&a(l),t&&a(o);for(let t=0;t<d.length;t+=1)d[t].d();i=!1,s()}}}function oe(t,e){let n,l,o,i,s,f,h,y,v=e[56].label+"";function w(){e[45].call(f,e[56],e[54],e[55])}return{key:t,first:null,c(){n=u("div"),l=u("p"),o=d(v),i=p(),s=u("div"),f=u("input"),b(l,"class","label"),b(f,"class","input"),b(f,"type","text"),b(f,"placeholder",e[56].placeholder),b(s,"class","control"),b(n,"class","field"),this.first=n},m(t,a){c(t,n,a),r(n,l),r(l,o),r(n,i),r(n,s),r(s,f),g(f,e[53][e[56].symbol]),h||(y=m(f,"input",w),h=!0)},p(t,n){e=t,263696&n[0]&&f.value!==e[53][e[56].symbol]&&g(f,e[53][e[56].symbol])},d(t){t&&a(n),h=!1,y()}}}function ie(t,e){let n,l,o,i,s,f,h,y,g,w,k=e[53].name+"",x=[],_=new Map;function $(){return e[44](e[55])}let C=e[18];const M=t=>t[56].symbol;for(let t=0;t<C.length;t+=1){let n=xt(e,C,t),l=M(n);_.set(l,x[t]=oe(l,n))}return{key:t,first:null,c(){n=u("div"),l=u("div"),o=u("p"),i=d(k),s=p(),f=u("button"),f.innerHTML="<span>-</span>",h=p();for(let t=0;t<x.length;t+=1)x[t].c();y=p(),b(o,"class","is-size-5 has-text-weight-bold"),b(f,"type","button"),b(f,"class","button is-danger"),b(l,"class","vm-header"),b(n,"class","box"),this.first=n},m(t,e){c(t,n,e),r(n,l),r(l,o),r(o,i),r(l,s),r(l,f),r(n,h);for(let t=0;t<x.length;t+=1)x[t].m(n,null);r(n,y),g||(w=m(f,"click",$),g=!0)},p(t,l){e=t,16&l[0]&&k!==(k=e[53].name+"")&&v(i,k),262160&l[0]&&(C=e[18],x=T(x,l,M,1,e,C,_,n,U,oe,y,xt))},d(t){t&&a(n);for(let t=0;t<x.length;t+=1)x[t].d();g=!1,w()}}}function se(e){let n;return{c(){n=d("Failed to deploy VM.")},m(t,e){c(t,n,e)},p:t,d(t){t&&a(n)}}}function re(t){let e;return{c(){e=d(t[5])},m(t,n){c(t,e,n)},p(t,n){32&n[0]&&v(e,t[5])},d(t){t&&a(e)}}}function ce(e){let n;return{c(){n=d("> Loading...")},m(t,e){c(t,n,e)},p:t,d(t){t&&a(n)}}}function ae(t){let e,n,l;return{c(){e=d("> "),n=d(t[5]),l=d(".")},m(t,o){c(t,e,o),c(t,n,o),c(t,l,o)},p(t,e){32&e[0]&&v(n,t[5])},d(t){t&&a(e),t&&a(n),t&&a(l)}}}function ue(t){let e;return{c(){e=d("Deploy")},m(t,n){c(t,e,n)},d(t){t&&a(e)}}}function de(t){let e;return{c(){e=d("Back")},m(t,n){c(t,e,n)},d(t){t&&a(e)}}}function pe(e){let n,o,i,s,d,f,y,v,g,k,x,_,$;function C(t,e){return t[1]?Dt:t[2]?Vt:t[3]?Ft:It}let M=C(e),N=M(e);function P(t,e){return t[2]||t[3]?de:ue}let S=P(e),A=S(e);return{c(){n=u("div"),o=u("form"),i=u("h4"),i.textContent="Deploy a Virtual Machine",s=p(),d=u("hr"),f=p(),N.c(),y=p(),v=u("div"),g=u("button"),A.c(),this.c=t,b(i,"class","is-size-4"),b(g,"class",k="button is-primary "+(e[1]?"is-loading":"")),b(g,"type","submit"),g.disabled=x=(e[1]||!e[4].valid)&&!(e[2]||e[3])||!e[12]||""===e[12].mnemonics||""===e[12].storeSecret,b(v,"class","actions"),b(o,"class","box"),w(n,"padding","15px")},m(t,l){c(t,n,l),r(n,o),r(o,i),r(o,s),r(o,d),r(o,f),N.m(o,null),r(o,y),r(o,v),r(v,g),A.m(g,null),_||($=[m(g,"click",e[46]),m(o,"submit",h(e[19]))],_=!0)},p(t,e){M===(M=C(t))&&N?N.p(t,e):(N.d(1),N=M(t),N&&(N.c(),N.m(o,y))),S!==(S=P(t))&&(A.d(1),A=S(t),A&&(A.c(),A.m(g,null))),2&e[0]&&k!==(k="button is-primary "+(t[1]?"is-loading":""))&&b(g,"class",k),5662&e[0]&&x!==(x=(t[1]||!t[4].valid)&&!(t[2]||t[3])||!t[12]||""===t[12].mnemonics||""===t[12].storeSecret)&&(g.disabled=x)},i:t,o:t,d(t){t&&a(n),N.d(),A.d(),_=!1,l($)}}}function fe(t,e,n){let l,o,i;var r,c,a,u;const{events:d}=null!==(c=null===(r=window.configs)||void 0===r?void 0:r.grid3_client)&&void 0!==c?c:{},p=null===(a=window.configs)||void 0===a?void 0:a.baseConfig;s(t,p,(t=>n(26,i=t)));const f=null===(u=window.configs)||void 0===u?void 0:u.deploymentStore;let m="Config",h=!1,b=!1,v=!1,g=0;const w=new ot;requestAnimationFrame((()=>{n(4,w.envs=[new nt(void 0,"SSH_KEY",null==o?void 0:o.sshKey)],w)}));const k=[{label:"CPU",symbol:"cpu",placeholder:"Your CPU",type:"number"},{label:"Memory",symbol:"memory",placeholder:"Your Memory in MB",type:"number"},{label:"Public IP",symbol:"publicIp",placeholder:"",type:"checkbox"},{label:"Planetary Network",symbol:"planetary",placeholder:"",type:"checkbox"}],_=[{label:"FList",symbol:"flist",placeholder:"Your flist"},{label:"Entry Point",symbol:"entrypoint",placeholder:"Your Entrypoint"}],$=[{label:"Key",symbol:"key",placeholder:"Your Env Key"},{label:"Value",symbol:"value",placeholder:"Your Env Value"}],C=[{label:"Name",symbol:"name",placeholder:"Your Disk Name"},{label:"Size",symbol:"size",placeholder:"Disk size in GB",type:"number"},{label:"Mount Point",symbol:"mountpoint",placeholder:"Your Disk Mount Point"}];let M;const N=[{name:"Alpine",url:"https://hub.grid.tf/tf-official-apps/base:latest.flist",entryPoint:"/sbin/zinit init"},{name:"Ubuntu",url:"https://hub.grid.tf/omar0.3bot/omarelawady-ubuntu-20.04.flist",entryPoint:"/init.sh"}];let P;const S={accessNodeV4:!1,accessNodeV6:!0,gateway:!1,city:"",country:"",farmId:null,cru:null,hru:null,mru:null,sru:null},A=[{label:"Access Node V4 Filter",symbol:"accessNodeV4",type:"checkbox"},{label:"Access Node V6 Filter",symbol:"accessNodeV6",type:"checkbox"},{label:"Gateway Filter",symbol:"gateway",type:"checkbox"},{label:"City Filter",symbol:"city",type:"text"},{label:"Country Filter",symbol:"country",type:"text"},{label:"Farm ID Filter",symbol:"farmId",type:"number"},{label:"CRU Filter",symbol:"cru",type:"number"},{label:"HRU Filter",symbol:"hru",type:"number"},{label:"MRU Filter",symbol:"mru",type:"number"},{label:"SRU Filter",symbol:"sru",type:"number"}];let E,I=[],F=!1;return t.$$.update=()=>{67108864&t.$$.dirty[0]&&n(11,l=i),100663296&t.$$.dirty[0]&&n(12,o=i[g])},[m,h,b,v,w,M,P,S,E,I,F,l,o,p,[{label:"Config"},{label:"Environment Variables"},{label:"Disks"}],k,_,$,C,function(){function t(t){"string"==typeof t&&n(5,M=t)}n(1,h=!0),n(2,b=!1),n(3,v=!1),n(5,M=void 0),d.addListener("logs",t),ht(w,o).then((()=>{f.set(0),n(2,b=!0)})).catch((t=>{n(3,v=!0),n(5,M="string"==typeof t?t:t.message)})).finally((()=>{n(1,h=!1),d.removeListener("logs",t)}))},N,function(){P&&+P<=N.length&&(n(4,w.flist=N[P].url,w),n(4,w.entrypoint=N[P].entryPoint,w))},t=>n(25,g=t.target.selectedIndex),A,function(){n(10,F=!0),function(t,e){return new Promise((async n=>{const{networkEnv:l}=e,o=new gt("","","",null),{graphql:i,rmbProxy:s}=o.getDefaultUrls(l),r=new wt(i,s);try{n((await r.filterNodes(t)).map((t=>t.nodeId)))}catch(t){n([])}}))}(S,o).then((t=>{n(9,I=t)})).finally((()=>n(10,F=!1)))},g,i,t=>n(0,m=t.label),function(){w.name=this.value,n(4,w),n(9,I),n(10,F)},function(){P=x(this),n(6,P),n(20,N)},function(t){w[t.symbol]=this.value,n(4,w),n(16,_),n(9,I),n(10,F)},function(t){w[t.symbol]=y(this.value),n(4,w),n(15,k),n(9,I),n(10,F)},t=>n(4,w[t.symbol]=!w[t.symbol],w),function(t){w[t.symbol]=this.value,n(4,w),n(15,k),n(9,I),n(10,F)},function(){E=x(this),n(8,E)},function(t){S[t.symbol]=this.checked,n(7,S),n(23,A)},function(t){S[t.symbol]=this.value,n(7,S),n(23,A)},function(t){S[t.symbol]=y(this.value),n(7,S),n(23,A)},function(){w.nodeId=x(this),n(4,w),n(9,I),n(10,F)},function(){w.nodeId=y(this.value),n(4,w),n(9,I),n(10,F)},()=>n(4,w.envs=[...w.envs,new nt],w),t=>n(4,w.envs=w.envs.filter(((e,n)=>t!==n)),w),function(t,e,l){e[l][t.symbol]=this.value,n(4,w),n(17,$),n(9,I),n(10,F)},()=>n(4,w.disks=[...w.disks,new lt],w),t=>n(4,w.disks=w.disks.filter(((e,n)=>t!==n)),w),function(t,e,l){e[l][t.symbol]=this.value,n(4,w),n(18,C),n(9,I),n(10,F)},t=>{(b||v)&&(t.preventDefault(),n(2,b=!1),n(3,v=!1),n(1,h=!1))}]}!function(t,e){try{customElements.define(`tf-${t}`,e)}catch(e){console.warn(`Element with name '${t}' already defined.`)}}("vm",class extends H{constructor(t){super(),this.shadowRoot.innerHTML='<style>@import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");.actions{display:flex;justify-content:flex-end;align-items:center}.vm-container{overflow-x:hidden;overflow-y:auto;max-height:70vh;will-change:transform;padding-bottom:5rem;margin-bottom:20px}.vm-header{display:flex;align-items:center;justify-content:space-between}.switch{position:relative;display:inline-block;width:60px;height:34px}.switch input{opacity:0;width:0;height:0}.switch .slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:0.4s;transition:0.4s;border-radius:34px}.switch .slider:before{position:absolute;content:"";height:26px;width:26px;left:4px;bottom:4px;background-color:white;-webkit-transition:0.4s;transition:0.4s;border-radius:50%}.switch input:checked+.slider{background-color:#2196f3}.switch input:checked+.slider{box-shadow:0 0 1px #2196f3}.switch input:checked+.slider:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px)}.select,.select>select{width:100%}</style>',R(this,{target:this.shadowRoot,props:_(this.attributes),customElement:!0},fe,pe,i,{},null,[-1,-1,-1]),t&&t.target&&c(t.target,this,t.anchor)}})}();
