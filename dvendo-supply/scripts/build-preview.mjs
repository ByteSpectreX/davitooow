// Build a self-contained, local-only preview. Production source is read, never edited.
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=resolve(dirname(fileURLToPath(import.meta.url)),'../apps/web/preview'),read=p=>readFileSync(resolve(here,p),'utf8');
const script=code=>'<script>\n'+code.replaceAll('</script','<\\/script')+'\n</script>';
const mark=read('dvendo-supply-mark.svg').replace('role="img" aria-label="DVendo Supply monogram"','aria-hidden="true"');
const fontFaces=[
 {file:'inter-latin-ext-wght-normal.woff2',range:'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'},
 {file:'inter-latin-wght-normal.woff2',range:'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'}
].map(f=>'@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,'+readFileSync(resolve(here,'fonts',f.file)).toString('base64')+') format("woff2");unicode-range:'+f.range+';}').join('\n');
const fontLicense='/*\n'+read('fonts/Inter-LICENSE.txt').replaceAll('*/','* /')+'\n*/';
const styles=[fontLicense,fontFaces,read('base/app.css'),read('base/operations.css'),read('supplier-redesign.css')].join('\n');
const theme="try { document.documentElement.dataset.theme=localStorage.getItem('supplier-preview-theme')||'dark'; } catch { document.documentElement.dataset.theme='dark'; }";
const html=[
'<!doctype html>',
'<html lang="en" data-theme="dark"><head>',
'<meta charset="utf-8">',
'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
'<meta name="theme-color" content="#141414">',
'<meta name="description" content="A local sample-data preview of DVendo Supply: supplier funding, manager SIM plans and shared SIM details.">',
"<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'\">",
'<title>DVendo Supply — Supplier & manager preview</title>',
'<style>'+styles+'</style>',script(theme),'</head><body>',
'<div class="d-preview-bar"><span class="d-preview-label"><i></i><span>INTERACTIVE PREVIEW · Sample data</span></span><div class="d-preview-controls"><label class="d-sr" for="previewRole">Preview role</label><select id="previewRole"><option value="admin">Supplier Admin</option><option value="manager">Account Manager</option></select><label class="d-sr" for="previewManager">Preview manager portfolio</label><select id="previewManager" class="hidden"></select><button type="button" data-action="reset">Reset demo</button></div></div>',
'<div class="d-shell">',
'<aside class="d-sidebar" aria-label="Workspace navigation"><div class="d-brand"><span class="d-brand-symbol">'+mark+'</span><div><strong>DVendo Supply</strong><small>SIM & promo supply</small></div></div><span class="d-nav-caption">WORKSPACE</span><nav id="sideNav" class="d-side-nav" aria-label="Main"></nav><div class="d-side-footer"><div class="d-side-tip"><strong>A steady supply.</strong><br>Managers choose the promos.<br>Suppliers keep renewals funded.</div><div class="d-user"><span class="d-avatar" id="userAvatar">SA</span><div><strong id="userName">Supplier workspace</strong><small id="userRole">Supplier Admin</small></div></div><button id="themeButton" type="button" data-action="theme">Appearance</button></div></aside>',
'<div class="d-main"><header class="d-topbar"><div><span class="d-eyebrow" id="pageEyebrow">SUPPLIER ADMIN</span><h1 id="pageTitle" tabindex="-1">Supply overview</h1></div><div class="d-topbar-actions"><span class="d-workspace-status"><i></i>Sample workspace</span><button class="d-bell" data-action="notifications" type="button" aria-label="Notifications"><svg class="d-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16l-2-3V9a6 6 0 0 0-12 0v5l-2 3Zm6 3h4"/></svg></button></div></header><main id="workspace" class="d-content"></main></div>',
'</div>',
'<nav id="mobileNav" class="d-mobile-nav" aria-label="Mobile navigation"></nav>',
'<dialog id="dialog" class="d-dialog" aria-labelledby="dialogTitle"><div id="dialogBody" class="d-dialog-body"></div></dialog>',
'<div id="toast" class="d-toast" role="status" aria-live="polite"></div>',
script(read('supplier-redesign-model.js')),script(read('supplier-redesign-ui.js')),
'</body></html>'
].join('\n');
writeFileSync(resolve(here,'../public/index.html'),html);
console.log('Built the local role redesign with the existing DVendo theme, custom mark and synthetic product model.');
