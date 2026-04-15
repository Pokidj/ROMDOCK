let data={},draggedItem=null,editTarget=null;

/* LOAD */
fetch("/ROMDOCK/data.json",{cache:"no-store"})
.then(r=>{
if(!r.ok) throw new Error("No carga data.json");
return r.json();
})
.then(j=>{data=j;render();})
.catch(err=>console.error(err));

function cleanCategories(){
Object.keys(data).forEach(c=>{
if(!data[c]||data[c].length===0) delete data[c];
});
}

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
data-section="${section}"
data-name="${item.name}"
onclick='handleClick(${JSON.stringify(section)},${JSON.stringify(item.name)})'>

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

function handleClick(section,name){
const item=data[section].find(i=>i.name===name);
if(item.links.length===1) window.open(item.links[0],"_blank");
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

/* MOCK */
function openModal(){}
function saveToGitHub(){}
