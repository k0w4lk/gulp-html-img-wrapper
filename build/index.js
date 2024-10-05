import logger from"fancy-log";import{JSDOM}from"jsdom";import PluginError from"plugin-error";import through2 from"through2";let pluginName="gulp-html-img-wrapper",attrs={t:"ghiw-exclude",i:"ghiw-picture-class",l:"ghiw-responsive-filenames",o:"ghiw-responsive-media",g:"ghiw-responsive-extensions"},gulpHtmlImgWrapper=function(m={}){return through2.obj(function(e,r,t){var i;if(e.isNull())t(null,e);else if(e.isStream())t(new PluginError(pluginName,"Streaming not supported"));else{try{let l=Object.assign({extensions:["jpg","png","jpeg"],p:!0},m),a=new RegExp(`.(${null==(i=l.extensions)?void 0:i.join("|")})$`,"i");var s=e.u.toString();let n=new JSDOM(s).window.document,o=0;var p,u=n.querySelectorAll("img");let g=e=>(e.removeAttribute(attrs.t),e.removeAttribute(attrs.i),e.removeAttribute(attrs.l),e.removeAttribute(attrs.o),e.removeAttribute(attrs.g),e);u.forEach(r=>{var e=null==(e=r.src.match(a))?void 0:e[1],t="picture"===(null==(t=null==(t=r.parentNode)?void 0:t.nodeName)?void 0:t.toLowerCase()),i=r.hasAttribute(attrs.t),s=!(null!=(s=l.extensions)&&s.includes(e||""));if(t||i||!e||s)g(r);else{let l=n.createElement("picture");t=r.src.replace("."+e,"");if(r.hasAttribute(attrs.i)&&l.classList.add(...r.getAttribute(attrs.i).split(" ")),r.hasAttribute(attrs.o)&&r.hasAttribute(attrs.l)&&r.hasAttribute(attrs.g)){i=r.getAttribute(attrs.g).split(";").map(e=>e.trim());let e=r.getAttribute(attrs.o).split(";").map(e=>e.trim()),s=r.getAttribute(attrs.l).split(";").map(e=>e.trim());i.forEach(i=>{e.forEach((e,r)=>{var t=n.createElement("source");t.srcset=s[r]+"."+i,t.media=`(${e})`,t.type="image/"+i,l.append(t)})})}else{s=n.createElement("source");s.srcset=t+".webp",s.type="image/webp",l.append(s)}g(r),l.append(r.cloneNode()),r.replaceWith(l),o++}}),e.u=Buffer.from(n.documentElement.outerHTML),this.push(e),l.p&&o&&(p=1===o?"image was":"images were",logger(pluginName+":",o+` ${p} wrapped in `+e.relative))}catch(e){this.emit("error",new PluginError(pluginName,e))}t()}})};export{gulpHtmlImgWrapper};