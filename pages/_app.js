import { MetomicProvider } from "@metomic/react";
import * as Sentry from "@sentry/node";
import { DefaultSeo } from "next-seo";
import { useEffect } from "react";
// import your default seo configuration
import SEO from "../next-seo.config";
import { useRouter } from 'next/router';
import { ThemeProvider, theme } from "@chakra-ui/core";
import { IntercomProvider, useIntercom } from "react-use-intercom";
import "../styles/index.scss";
import { isNil } from "lodash";
import * as Fathom from 'fathom-client';
import Script from 'next/script'

const customIcons = {
	secureLogo: {
		path: (
			<svg
				width="18"
				height="22"
				viewBox="0 0 18 22"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect width="18" height="22" fill="#E5E5E5" />
				<rect
					x="-3557"
					y="-1457"
					width="19820"
					height="11679"
					rx="538"
					stroke="black"
					strokeWidth="30"
				/>
				<g clipPath="url(#clip0)">
					<rect
						width="1440"
						height="900"
						transform="translate(-797 -527)"
						fill="white"
					/>
					<rect x="-586" y="-463" width="1229" height="836" fill="white" />
					<g filter="url(#filter0_f)">
						<rect
							x="-0.305176"
							y="-273.838"
							width="420.61"
							height="210.838"
							rx="20"
							fill="#2BCACA"
							fillOpacity="0.2"
						/>
					</g>
					<path
						d="M9 21C9 21 17 17 17 11V4L9 1L1 4V11C1 17 9 21 9 21Z"
						fill="#798594"
						stroke="#798594"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M14 7L7.125 14L4 10.8182"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<rect
						x="-22.5"
						y="-26.5"
						width="465"
						height="75"
						rx="7.5"
						stroke="#E2ECF9"
					/>
				</g>
				<defs>
					<filter
						id="filter0_f"
						x="-75.3052"
						y="-348.838"
						width="570.61"
						height="360.838"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="BackgroundImageFix"
							result="shape"
						/>
						<feGaussianBlur
							stdDeviation="37.5"
							result="effect1_foregroundBlur"
						/>
					</filter>
					<clipPath id="clip0">
						<rect
							width="1440"
							height="900"
							fill="white"
							transform="translate(-797 -527)"
						/>
					</clipPath>
				</defs>
			</svg>
		),
	},
	walletIcon: {
		path: (
			<svg
				width="100"
				height="90"
				viewBox="0 0 100 90"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M85 20H80V15C80 11.0218 78.4196 7.20644 75.6066 4.3934C72.7936 1.58035 68.9782 0 65 0H15C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15V75C0 78.9782 1.58035 82.7936 4.3934 85.6066C7.20644 88.4196 11.0218 90 15 90H85C88.9782 90 92.7936 88.4196 95.6066 85.6066C98.4196 82.7936 100 78.9782 100 75V35C100 31.0218 98.4196 27.2064 95.6066 24.3934C92.7936 21.5804 88.9782 20 85 20ZM15 10H65C66.3261 10 67.5979 10.5268 68.5355 11.4645C69.4732 12.4021 70 13.6739 70 15V20H15C13.6739 20 12.4021 19.4732 11.4645 18.5355C10.5268 17.5979 10 16.3261 10 15C10 13.6739 10.5268 12.4021 11.4645 11.4645C12.4021 10.5268 13.6739 10 15 10ZM90 60H85C83.6739 60 82.4021 59.4732 81.4645 58.5355C80.5268 57.5979 80 56.3261 80 55C80 53.6739 80.5268 52.4021 81.4645 51.4645C82.4021 50.5268 83.6739 50 85 50H90V60ZM90 40H85C81.0218 40 77.2064 41.5803 74.3934 44.3934C71.5804 47.2064 70 51.0218 70 55C70 58.9782 71.5804 62.7936 74.3934 65.6066C77.2064 68.4196 81.0218 70 85 70H90V75C90 76.3261 89.4732 77.5979 88.5355 78.5355C87.5979 79.4732 86.3261 80 85 80H15C13.6739 80 12.4021 79.4732 11.4645 78.5355C10.5268 77.5979 10 76.3261 10 75V29.15C11.6063 29.7151 13.2972 30.0025 15 30H85C86.3261 30 87.5979 30.5268 88.5355 31.4645C89.4732 32.4021 90 33.6739 90 35V40Z"
					fill="#2BCACA"
				/>
			</svg>
		),
	},
};

const customTheme = {
	...theme,
	icons: {
		...theme.icons,
		...customIcons,
	},
	colors: {
		...theme.colors,
		teal: {
			...theme.colors.teal,
			300: "#45E2E2",
			500: "#2BCACA",
			700: "#20B1B1",
		},
		pink: {
			...theme.colors.pink,
			300: "#FF9DC0",
			500: "#FF7CAB",
			700: "#EF6093",
		},
		orange: {
			...theme.colors.orange,
			500: "#F5B100",
		},
	},
	opacity: {
		...theme.opacity,
		10: ".1",
		20: ".2",
		30: ".3",
		40: ".4",
		50: ".5",
		60: ".6",
		70: ".7",
		80: ".8",
		90: ".9",
	},
};

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		environment: process.env.NODE_ENV,
		enabled: process.env.NODE_ENV === "production",
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	});
}

export default function YieldScanApp({ Component, pageProps, err }) {

	
	const router = useRouter();
	const projectId = isNil(process.env.NEXT_PUBLIC_METOMIC_PROJECT_ID)
		? ""
		: process.env.NEXT_PUBLIC_METOMIC_PROJECT_ID;
	const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_ID;

	useEffect(() => {
		Fathom.load(process.env.NEXT_PUBLIC_FATHOM_ID, {
		  //includedDomains: ["yieldscan.app", "dev.yieldscan.app"],
		  url: process.env.NEXT_PUBLIC_FATHOM_SUBDOMAIN,
		});
	
		function onRouteChangeComplete() {
			Fathom.trackPageview();
		  }
	
		  // Record a pageview when route changes
		  router.events.on('routeChangeComplete', onRouteChangeComplete);
	
		  // Unassign event listener
		  return () => {
			router.events.off('routeChangeComplete', onRouteChangeComplete);
		  };
		}, []);

	return (
		<>
		<Script
		strategy="beforeInteractive"
		onLoad={() => {console.log("loaded")}}
  		dangerouslySetInnerHTML={{
    	__html: `(()=>{"use strict";var e={667:(e,n)=>{n.C=void 0,function(e){e[e.loading=0]="loading",e[e.ready=1]="ready",e[e.error=2]="error"}(n.C||(n.C={}))}},n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{}};return e[r](o,o.exports,t),o.exports}(()=>{var e,n,r,o=function(e,n){return l(n,"toString",{value:function(){return e+"() { [native code] }"}}),n},i=[],u=!1,a=function(e,n){var t=(n?n.ownerDocument.defaultView:null)||window,r=t.performance;if(!r)return!0;u||t!==window||(r.addEventListener("resourcetimingbufferfull",(function(){for(var e=new Set,n=0,t=r.getEntriesByType("resource");n<t.length;n++){var o=t[n];e.add(o.name)}i.push(e),i.length>3&&i.shift(),r.clearResourceTimings()})),u=!0),e=e.replace(/^\/\//,location.protocol+"//");var o=r.getEntriesByName(e);if(o&&0===o.length&&"/"!==e[e.length-1]&&(o=r.getEntriesByName(e+"/")),0===o.length)for(var a=0,c=i;a<c.length;a++){var l=c[a];(l.has(e)||l.has(e+"/"))&&(o=[{name:e}])}return 0!==o.length},c=function(e,n){return e?Object.getOwnPropertyDescriptor(e,n)||c(Object.getPrototypeOf(e),n):{enumerable:!0,configurable:!0}},l=function(e,n,t){var r,o=c(e,n);if(!e||!1===(null===(r=Object.getOwnPropertyDescriptor(e,n))||void 0===r?void 0:r.configurable))return{object:e,originalDescriptor:o,originalGet:function(){return o.get?o.get:function(){return o.value}},originalSet:o.set?o.set:function(t){return e[n]=t}};var i=void 0!==t.value,u={enumerable:void 0!==t.enumerable?t.enumerable:o.enumerable,configurable:void 0!==t.configurable?t.configurable:o.configurable};i?(u.writable=void 0!==t.writable?t.writable:void 0===o.writable||o.writable,u.value=t.value||o.value):(u.get=t.get||o.get||function(){return e[n]},u.set=t.set||o.set||function(t){return e[n]=t});try{Object.defineProperty(e,n,u)}catch(t){}return{object:e,originalDescriptor:o,originalGet:i?function(){return o.value}:o.get?o.get:function(){},originalSet:i?function(t){return e[n]=t}:o.set?o.set:function(e){return e}}},f=function(e){return!e.hasOwnProperty("__du")&&(l(e,"__du",{value:null,enumerable:!1}),!0)},s=Math.pow(2,32),d=function(e){for(var n=0,t=1779033703^e.length;n<e.length;n++)t=(t=Math.imul(t^e.charCodeAt(n),3432918353))<<13|t>>>19;return function(e){return void 0===e&&(e=0),t=Math.imul(t^t>>>16,(2246822507+e)%s),t=Math.imul(t^t>>>13,3266489909),(t^=t>>>16)>>>0}},v=function(e,n,t){void 0===t&&(t=1),t>0&&(e=btoa(e).replace(/[=]+$/,""));for(var r,o,i,u=d(n),a=new Array(e.length),c=e.length,l=u(e.length),f=0,s=0;c-- >0;)a[c]=(void 0,64,r=f=(o=(s=(i=e[c].charCodeAt(0))>96?i-59:i>64?i-53:i>46?i-46:43===i?0:1)+t*l)<0?(o%64+64)%64:o%64,String.fromCharCode(r>37?r+59:r>11?r+53:r>0?r+46:43)),l=u(t>0?s:f);var v=a.join("");return t>0?v.replace(/\//g,"-"):atob(v)},p=function(e){return(d(e)()+Math.floor(Date.now()/864e5))%s},h=function(e){return Math.floor(Number.MAX_SAFE_INTEGER*e).toString(36)},y=function(e,n,t){var r,o=p(n),i=(r=o,function(){var e=r+=1831565813;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/s});return function(e,n){for(var t=[],r=0;r<e.length&&t.push(e.substring(r,r+=3+(20*n()>>0))););return t.join("/")}(v(e+(-1===e.indexOf("?")?"?__du=":"&__du=")+(t?t.join(",")+"+":"")+h(i()),n),i)},g=function(e){return console.error.call(console,e)},b=function(e,n,t){var r=e.currentTarget,o=e.target,i=n||r,u=t||o,a=function(e,n){for(var t={},r=0,o=Object.entries(n);r<o.length;r++){var i=o[r],u=i[0],a=i[1];t[u]=l(e,u,a)}return t}(e,{currentTarget:{get:function(){return i}},target:{get:function(){return u}},srcElement:{get:function(){return u}},path:{get:function(){return a.originalGet.apply(this).slice().map((function(e){return n&&r===e?n:t&&o===e?t:e}))}}}).path;return function(){delete e.currentTarget,delete e.target,delete e.srcElement,delete e.path}},m=function(e,n){try{return e(n)}catch(e){g(e)}},w=function(e,n){try{if("function"==typeof e)return e(n);if(e&&"function"==typeof e.handleEvent)return e.handleEvent(n)}catch(e){g(e)}},E=function(e,n){if("function"==typeof e.addEventListener){e.constructor.name;var t=[],r=[],i=[],u=[],a=function(e){var n=r[e];return!!n&&(n(),r[e]=void 0,!0)},c=l(e,"addEventListener",{value:o("addEventListener",(function(e,r){var o=n.findIndex((function(n){return n.event===e}));return-1!==o?void t[o].push(r):c().apply(this,arguments)}))}).originalGet;if("function"==typeof e.setAttribute)var f=l(e,"setAttribute",{value:o("setAttribute",(function(t,r){var o=n.findIndex((function(e){return"on"+e.event===t}));return-1!==o&&i[o]?(i[o](Function(r).bind(e)),this):f().apply(this,arguments)}))}).originalGet;for(var s=function(o){var f=n[o],s=f.event,d=f.on,v="on"+s,p="function"==typeof e[v]?e[v].bind(e):null,h=-1,y=function(e){(p=e)?-1===h&&(h=t[o].length-1):h=-1},g=function(n){-1===h&&p&&w(p,n),t[o].forEach((function(t,r){w("function"==typeof t?t.bind(e):t,n),r===h&&p&&w(p,n)}))};t.push([]),i.push(y),u.push(g),p&&(e[v]=null),void 0!==e[v]&&l(e,v,{set:function(e){return y("function"==typeof e?e.bind(this):null),e},get:function(){return p}}),c().call(e,s,(function(e){var t=b(e);r[o]=function(){g(e),t()},d&&d((function(){return a(o)}),(function(e,t){return t?(u[n.findIndex((function(n){return n.event===e}))](t),!0):a(n.findIndex((function(n){return n.event===e})))}),(function(e){return t=n.findIndex((function(n){return n.event===e})),void(r[t]=void 0);var t}))}))},d=0;d<n.length;++d)s(d)}},O="undefined"!=typeof window&&window,P=new Set(Object.keys(O)),x={},N=1,I=function(e,n){if(!/^https?:\/\//.test(e)||e.replace(/^https?:\/\//,"").replace(/\/.*$/,"")===location.host)return 0;if(e.startsWith(location.protocol+"//"+n.o))return 0;for(var t={window:{}},r=N++,o=0,i=Object.keys(window);o<i.length;o++){var u=i[o];if(!P.has(u)&&!u.startsWith("webkit")&&"window"!==u){var a=void 0;try{a=window[u]}catch(e){continue}a!==O&&(t.window[u]={ref:a,entries:a instanceof Object?Object.entries(a).concat(a instanceof Array?[["length",a.length]]:[]):[]})}}return x[r]=t,r},R=function(e,n){var t=n.window,r=window,o=t[e];if(o){if(r[e]!==o.ref&&m((function(){return r[e]=o.ref})),r[e]instanceof Object){for(var i=function(n){if(o.entries.find((function(e){return e[0]===n})))return"continue";delete r[e][n]},u=0,a=Object.keys(r[e]);u<a.length;u++)i(a[u]);for(var c=function(n,t){if(r[e][n]===t)return"continue";m((function(){return r[e][n]=t}))},l=0,f=o.entries;l<f.length;l++){var s=f[l];c(s[0],s[1])}}}else r[e]&&delete r[e]},T=function(e){delete x[e]},C=window.document.createElement,S=window.MutationObserver,_=t(667),A=_.C.loading,L=null,j=l([],"push",{value:function(e){L=e,function(e){G.on(Y),U(_.C.ready);for(var n=0,t=K;n<t.length;n++){var r=t[n];Y(r)}}()}}).object,M="3.0.3",H={type:"dns",urlKey:"u7uggtnx9i7f",encKey:"g9fuiv6m8z2w"},D="testinganalytics.yieldscan.app",q="dns"===H.type?H.urlKey+"."+D:D+"/"+H.urlKey,B=function(e,n){return y(e,H.encKey,n)},G=(e=[],Object.freeze({on:function(n){return"function"==typeof n&&e.push(n)},emit:function(n){var t=this;return e.forEach((function(e){return e.apply(t,[n])}))}})),K=[],k=Object.freeze({cb:G,v:M,i:document.getElementsByTagName("SCRIPT").length,h:"TCI4Zm8nOE1qSSFbT0tbKTxKa1sgY0IqJg",r:function(e,n,t){var r=x[e];if(r){for(var o=0,i=n;o<i.length;o++){var u=i[o];R(u,r)}"function"==typeof t&&t(r,(function(e){return R(e,r)})),T(e)}},o:D,e:K,ep:B,dp:function(e){return n=H.encKey,v(e.replace(/\//g,""),n,-1);var n},a:function(){return A},d:j,c:Number("-1627899572216"),p:H}),U=function(e){return A=e},X=function(){return A},W=function(e){if(e.onNoProxy)try{e.onNoProxy()}catch(e){}},Y=function(e){var n=L;if(n){var t=function(e,n,t){if(!e)return"";var r=n.a,o=n.b,i=n.c,u=(0===e.indexOf("/")?location.protocol:e).replace(/:.*$/,""),a=e.match(/^(?:https?:)?\/\/([^/]+)(.*)/)||[],c=(a[0],a[1]),l=a[2],f=location.protocol+"//"+q;if(!c)return"";if(0===c.indexOf(location.hostname))return"";if(0===e.indexOf(f))return"";var s=c.toLowerCase(),d="*."+(s.match(/(?:[^\.]+\.)?[^\.]+$/)||[""])[0],v=-1!==r.indexOf(s),p=-1!==o.indexOf(s),h=-1!==r.indexOf(d),y=-1!==o.indexOf(d);return p||!v&&(i?y:!h)?"":f+"/"+B(u+"/"+c+(l||""),t)}(e.url,n,e.flags);if(t)try{e.onProxy(t)}catch(n){W(e)}else W(e)}else W(e)},$=/^(?:https?:)?\/\//,z=location&&location.protocol||"https",F=location&&location.host||"",V=z+"//"+q.replace(/^\*/,(function(){return h(p(H.urlKey))}))+"/"+y(z.replace(/:/,"")+"/api.dataunlocker.com/static/v1/async.js?v="+encodeURIComponent(M),H.encKey),J=q.split("/")[0].replace(/:[0-9]+$/,"").endsWith(F.replace(/:[0-9]+$/,"")),Q=function(){U(_.C.error);for(var e=0,n=K;e<n.length;e++){var t=n[e];W(t)}},Z=!1,ee=function(e){if(e.url)if(X()!==_.C.error){var n=(F.match(/(?:[^.]+\.)?[^.]+$/)||[])[0]||F;$.test(e.url)&&!e.url.replace($,"").replace(/\/.*/,"").endsWith(n)?(X()!==_.C.ready&&K.push(e),G.emit(e),function(){if(!Z){if(Z=!0,!J)return void Q();var e=C.call(document,"SCRIPT"),n=function(){e.parentNode&&e.parentNode.removeChild(e)};e.setAttribute("async",""),e.setAttribute("src",V),e.addEventListener("load",(function(){n()})),e.addEventListener("error",(function(e){n(),Q()})),document.head.appendChild(e)}}()):W(e)}else W(e);else W(e)},ne=navigator.sendBeacon.bind(navigator),te=["application/x-www-form-urlencoded","multipart/form-data","text/plain"],re=function(e){var n=e.tagName,t=e.onProxy;return function(e,r){if(f(e)){var o=r&&e.src&&"SCRIPT"===n?I(e.src,k):0;if("SCRIPT"===n&&S&&!r){var i=setTimeout((function(){u.disconnect()}),1e4),u=new S((function(){document.contains(e)&&(clearTimeout(i),u.disconnect(),e.src&&(o=I(e.src,k)))}));u.observe(document,{childList:!0,subtree:!0})}E(e,[{event:"error",on:function(n,r){ee({url:e.src,onProxy:function(o){return t({newUrl:o,element:e,releaseErrorHandlers:n,fireLoadHandlers:function(n){var t=b(n,e,e);r("load",n),t()}})},onNoProxy:n})}},{event:"load",on:function(n){if(!e.src||a(e.src,e))return n();var r=function(){o&&T(o),n()};ee({url:e.src,flags:["npe"].concat(o?["ss="+o]:[]),onProxy:function(n){return t({newUrl:n,element:e,releaseErrorHandlers:r,fireLoadHandlers:r})},onNoProxy:r})}}])}}},oe=re({tagName:"IMG",onProxy:function(e){var n=e.newUrl;e.element.src=n}}),ie=re({tagName:"SCRIPT",onProxy:function(e){var n=e.newUrl,t=e.element,r=e.releaseErrorHandlers,o=e.fireLoadHandlers;if(t.src){for(var i=C.call(document,"SCRIPT"),u=function(){i.parentNode&&i.parentNode.removeChild(i)},a=0,c=[].slice.call(t.attributes);a<c.length;a++){var l=c[a],f=l.name,s=l.value;"src"!==f&&"onerror"!==f&&"onload"!==f&&i.setAttribute(f,s)}i.setAttribute("src",n),i.addEventListener("error",(function(){r(),u()})),i.addEventListener("load",(function(e){o(e),u()})),t.parentNode?t.parentNode.insertBefore(i,t):document.head.appendChild(i)}else r()}}),ue=function(e,n,t,r){return new(t||(t=Promise))((function(o,i){function u(e){try{c(r.next(e))}catch(e){i(e)}}function a(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(u,a)}c((r=r.apply(e,n||[])).next())}))},ae=function(e,n){var t,r,o,i,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;u;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return u.label++,{value:i[1],done:!1};case 5:u.label++,r=i[1],i=[0];continue;case 7:i=u.ops.pop(),u.trys.pop();continue;default:if(!((o=(o=u.trys).length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){u=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){u.label=i[1];break}if(6===i[0]&&u.label<o[1]){u.label=o[1],o=i;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(i);break}o[2]&&u.ops.pop(),u.trys.pop();continue}i=n.call(e,u)}catch(e){i=[6,e],r=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,a])}}},ce=window.fetch,le=Image,fe=window.XMLHttpRequest,se=function(e){var n=new fe(e);return function(e){if(f(e)){var n,t,r=[],i=!1,u=!1,a=(e.constructor.name,e.hasOwnProperty("open")?e.open:null);l(e,"open",{value:o("open",(function(){return n=[].slice.call(arguments),(a||fe.prototype.open).apply(this,n)}))});var c=e.hasOwnProperty("send")?e.send:null;l(e,"send",{value:o("send",(function(){return t=[].slice.call(arguments),i=!0,(c||fe.prototype.send).apply(this,t)}))});var s=l(e,"setRequestHeader",{value:o("setRequestHeader",(function(e,n){try{var t=s().apply(this,arguments);return r.push([e,n]),t}catch(t){throw t}}))}).originalGet,d=!1,v=!0;E(e,[{event:"error",on:function(e){return d&&e()}},{event:"load",on:function(e){if(!i){if(v)return e();v=!0}}},{event:"loadend",on:function(e){if(u=!1,!i)return e()}},{event:"readystatechange",on:function(o,a,c){if(d=!1,4!==e.readyState)return o();if(e.status>=100&&e.status<400)return i=!1,r=[],c("error"),o();var l=function(){i=!1,r=[],o(),a("error")||(d=!0,a("load"),a("loadend"),u&&0!==e.status&&(v=!1))};if(!n)return l();ee({url:n[1],onProxy:function(o){var i=n.slice();i[1]=o,e.open.apply(e,i),u=!0;for(var a=0,c=r;a<c.length;a++){var l=c[a],f=l[0],d=l[1];s().call(e,f,d)}e.send.apply(e,t)},onNoProxy:l})}}])}}(n),n};se.prototype=fe.prototype,Object.setPrototypeOf(se,fe),[function(){if(S){var e=new S((function(e){for(var n=0,t=e;n<t.length;n++)for(var r=t[n],o=0;o<r.addedNodes.length;++o){var i=r.addedNodes[o];i instanceof HTMLScriptElement?ie(i,!0):i instanceof HTMLImageElement&&oe(i)}}));document.addEventListener("DOMContentLoaded",(function(){requestAnimationFrame((function(){e.disconnect()}))})),e.observe(document,{childList:!0,subtree:!0})}},function(){l(Document.prototype,"createElement",{value:o("createElement",(function(){var e=(arguments[0]||"").toUpperCase(),n=C.apply(this,[].slice.call(arguments));return"SCRIPT"===e?ie(n):"IMG"===e&&oe(n),n}))})},function(){ce&&l(window,"fetch",{value:o("fetch",(function(e,n){return ue(void 0,void 0,void 0,(function(){var t,r,o,i,u,c;return ae(this,(function(f){switch(f.label){case 0:t=e instanceof Request?e.url:e,r=e instanceof Request&&e.clone?function(){try{return e.clone()}catch(e){}}():void 0,o=function(o,i){return new Promise((function(u,a){ee({url:t,onProxy:function(t){!function(e,n){var t=n.originalInput,r=n.originalError,o=n.originalResult,i=n.originalRequestInit,u=n.clonedInput,a=n.resolve,c=n.reject;ue(void 0,void 0,void 0,(function(){var n,f,s,d;return ae(this,(function(v){switch(v.label){case 0:n=function(){return r?c(r):a(o)},v.label=1;case 1:if(v.trys.push([1,8,,9]),!(t instanceof Request))return[3,6];s=void 0,d=u||t,v.label=2;case 2:return v.trys.push([2,4,,5]),[4,d.blob()];case 3:return s=v.sent(),[3,5];case 4:return v.sent(),[3,5];case 5:return s&&"HEAD"!==d.method&&"GET"!==d.method&&l(d,"body",{value:s}),t=new Request(e,d),[3,7];case 6:t=e,v.label=7;case 7:return[3,9];case 8:return v.sent(),[2,n()];case 9:return v.trys.push([9,11,,12]),[4,ce.bind(window)(t,i)];case 10:return f=v.sent(),[3,12];case 11:return v.sent(),[2,n()];case 12:return 0!==f.status&&(f.status<100||f.status>399)?[2,n()]:[2,a(f)]}}))}))}(t,{originalInput:e,originalError:i,originalResult:o,originalRequestInit:n,clonedInput:r,resolve:u,reject:a})},onNoProxy:function(){i?a(i):u(o)}})}))},f.label=1;case 1:return f.trys.push([1,3,,5]),[4,ce(e,n)];case 2:return i=f.sent(),[3,5];case 3:return u=f.sent(),[4,o(void 0,u)];case 4:return[2,f.sent()];case 5:if(c=0!==i.status&&(i.status<100||i.status>399),0!==i.status||!i.clone)return[3,10];f.label=6;case 6:return f.trys.push([6,9,,10]),[4,i.clone().text()];case 7:return f.sent(),[4,new Promise((function(e){return setTimeout(e,0)}))];case 8:return f.sent(),a(t)||(c=!0),[3,10];case 9:return f.sent(),[3,10];case 10:return c?[4,o(i)]:[3,12];case 11:return[2,f.sent()];case 12:return[2,i]}}))}))}))})},function(){l(navigator,"sendBeacon",{value:o("sendBeacon",(function(e,n){if(window.hasOwnProperty("fetch")){var t=!n||!(n instanceof Blob&&!te.find((function(e){return n.type.startsWith(e)}))),r={method:"POST",keepalive:!0,credentials:t?"same-origin":"include",mode:t?"no-cors":"cors"};if(r.body=n||0===n?n:"",r.importance="low",r.body instanceof Blob){if(r.body.size>65536)return!1}else if(r.body&&"function"==typeof r.body.toString&&r.body.toString().length>65536)return!1;return fetch(e,r),!0}var o=ne(e,n);return o&&ee({url:e,onProxy:function(t){!function(e,n){if(performance){var t=3e4,r=function(){var o=performance.getEntriesByName(e),i=o[o.length-1];if(i){var u=i.duration||0;0===(0===u?i.responseEnd-i.startTime||0:u)&&n()}else{if((t-=500)<=0)return;setTimeout(r,500)}};setTimeout(r,0)}}(e,(function(){ne(t,n)}))}}),o}))})},function(){l(window,"XMLHttpRequest",{value:o("XMLHttpRequest",se)})},function(){l(window,"Image",{value:o("Image",(function(e,n){var t=new le(e,n);return oe(t),t}))})},function(){l(window,"8mwZYZ6",{enumerable:!1,configurable:!1,get:function(){return k}})}].map((function(e){try{e()}catch(e){}})),null===(r=null===(n=document.currentScript)||void 0===n?void 0:n.parentNode)||void 0===r||r.removeChild(document.currentScript)})()})();`
  }}	
/>
		<ThemeProvider theme={customTheme}>
			<MetomicProvider projectId={process.env.NEXT_PUBLIC_METOMIC_PROJECT_ID}>
				<IntercomProvider appId={intercomAppId} autoBoot={true}>
					<DefaultSeo {...SEO} />
					<Component {...pageProps} err={err} />
				</IntercomProvider>
			</MetomicProvider>
		</ThemeProvider>
		</>
	);
}
