let data={},draggedItem=null,editTarget=null;

/* LOAD */
fetch("/ROMDOCK/data.json",{cache:"no-store"})
.then(r=>r.json())
.then(j=>{data=j;render();});

/* LIMPIAR CATEGORÍAS */
function cleanCategories(){
Object.keys(data).forEach(c=>{
if(!data[c]||data[c].length===0) delete data[c];
});
}

/* TOAST */
function showToast(msg){
const t=document.getElementById("toast");
t.innerHTML=msg;
t.style.display="block";
setTimeout(()=>t.style.display="none",2500);
}

/* GITHUB */
async function saveToGitHub(){
let token=localStorage.getItem("gh_token");
if(!token){
token=prompt("Introduce tu GitHub Token:");
if(!token)return;
localStorage.setItem("gh_token",token);
}

showToast("⏳ Guardando...");

try{
const repo="pokidj/ROMDOCK";
const path="data.json";

const res=await fetch(`https://api.github.com/repos/${repo}/contents/${path}`,{
headers:{Authorization:`token ${token}`}
});
const file=await res.json();

const content=btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));

const update=await fetch(`https://api.github.com/repos/${repo}/contents/${path}`,{
method:"PUT",
headers:{Authorization:`token ${token}`,"Content-Type":"application/json"},
body:JSON.stringify({message:"update",content,sha:file.sha})
});

if(update.ok) showToast("🚀 Guardado correctamente");
else showToast("❌ Error");

}catch{
showToast("❌ Error conexión");
}
}

/* RENDER */
function render(){
cleanCategories();

const app=document.getElementById("app");
app.innerHTML="";

Object.keys(data).forEach(section=>{
let html=`<div class="section">
<div class="section-title">
<img src="/ROMDOCK/img/${section}.png" onerror="this.src='/ROMDOCK/img/default.png'">
${section}
</div><div class="row">`;

data[section].forEach(item=>{
html+=`<div class="card"
draggable="true"
ondragstart="dragStart(event)"
ondragover="dragOver(event)"
ondrop="dropItem(event)"
data-section="${section}"
data-name="${item.name}"
onclick='handleClick(${JSON.stringify(section)},${JSON.stringify(item.name)})'>

<div class="card-actions">
<button class="icon-btn" onclick='event.stopPropagation();openModal(${JSON.stringify(section)},${JSON.stringify(item.name)})'>✏️</button>
<button class="icon-btn" onclick='event.stopPropagation();deleteItem(${JSON.stringify(section)},${JSON.stringify(item.name)})'>🗑️</button>
</div>

<div class="logo-box">
<img src="/ROMDOCK/${item.img}" onerror="this.src='/ROMDOCK/img/default.png'">
</div>

<h3>${item.name}</h3>
</div>`;
});

html+="</div></div>";
app.innerHTML+=html;
});
}

/* DRAG */
function dragStart(e){
draggedItem={section:e.currentTarget.dataset.section,name:e.currentTarget.dataset.name};
}

function dragOver(e){e.preventDefault();}

function dropItem(e){
e.preventDefault();

const targetSection=e.currentTarget.dataset.section;
const targetName=e.currentTarget.dataset.name;
const sourceSection=draggedItem.section;

if(sourceSection===targetSection){
const list=data[targetSection];
const from=list.findIndex(i=>i.name===draggedItem.name);
const to=list.findIndex(i=>i.name===targetName);
const [m]=list.splice(from,1);
list.splice(to,0,m);
}else{
const s=data[sourceSection];
const t=data[targetSection];
const from=s.findIndex(i=>i.name===draggedItem.name);
const to=t.findIndex(i=>i.name===targetName);
const [m]=s.splice(from,1);
t.splice(to,0,m);
draggedItem.section=targetSection;
}

render();
}

/* CLICK */
function handleClick(section,name){
const item=data[section].find(i=>i.name===name);
if(!item || !item.links) return;

if(item.links.length===1){
window.open(item.links[0],"_blank");
}else{
showLinksPopup(item);
}
}

/* POPUP */
function showLinksPopup(item){
document.getElementById("popupLogo").src="/ROMDOCK/"+item.img;

const box=document.getElementById("linksContainerPopup");
box.innerHTML="";

item.links.forEach(link=>{
const url=new URL(link);
const favicon=`https://www.google.com/s2/favicons?domain=${url.hostname}`;

box.innerHTML+=`
<a class="link-btn" href="${link}" target="_blank">
<img src="${favicon}">
${url.hostname}
</a>`;
});

document.getElementById("linksPopup").style.display="flex";
}

function closeLinksPopup(){
document.getElementById("linksPopup").style.display="none";
}

/* CRUD */
function deleteItem(section,name){
data[section]=data[section].filter(i=>i.name!==name);
render();
}

/* MODAL */
function openModal(section=null,name=null){
document.getElementById("modal").style.display="flex";

const select=document.getElementById("category");
const newCat=document.getElementById("newCategory");
const newCatWrapper=newCat.parentElement;
  
select.innerHTML="";
Object.keys(data).forEach(c=>select.innerHTML+=`<option>${c}</option>`);

const container=document.getElementById("linksContainer");
container.innerHTML="";

if(name){
const item=data[section].find(i=>i.name===name);

document.getElementById("modalLogo").src="/ROMDOCK/"+item.img;
document.getElementById("name").value=item.name;
select.value=section;

item.links.forEach(l=>addLinkField(l));

newCatWrapper.style.display="none";// 🔥 ocultar en editar

editTarget={section,name};
}else{
document.getElementById("modalLogo").src="/ROMDOCK/img/default.png";
document.getElementById("name").value="";
newCatWrapper.style.display="block"; // 🔥 mostrar en crear

addLinkField();
editTarget=null;
}
}

function closeModal(){
document.getElementById("modal").style.display="none";
}

function addLinkField(val=""){
const c=document.getElementById("linksContainer");
const d=document.createElement("div");
d.className="link-row";
d.innerHTML=`<input value="${val}"><button onclick="this.parentElement.remove()">❌</button>`;
c.appendChild(d);
}

function saveItem(){
let section=document.getElementById("category").value;

const newCat=document.getElementById("newCategory").value.trim();
if(newCat) section=newCat;

const name=document.getElementById("name").value;

const links=[];
document.querySelectorAll("#linksContainer input").forEach(i=>{
if(i.value) links.push(i.value);
});

if(!data[section]) data[section]=[];

const imgPath="img/"+name+".png";

if(editTarget){
const old=editTarget.section;
const i=data[old].findIndex(x=>x.name===editTarget.name);
const item=data[old][i];

item.name=name;
item.links=links;
item.img=imgPath;

if(old!==section){
data[old].splice(i,1);
data[section].push(item);
}
}else{
data[section].push({name,links,img:imgPath});
}

closeModal();
render();
}

/* FILE */
function loadClick(){document.getElementById("fileInput").click();}

function loadJSON(e){
const r=new FileReader();
r.onload=ev=>{data=JSON.parse(ev.target.result);render();};
r.readAsText(e.target.files[0]);
}

function saveJSON(){
const blob=new Blob([JSON.stringify(data,null,2)]);
const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="data.json";
a.click();
}
