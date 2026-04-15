let data = {};

/* LOAD */
fetch("/ROMDOCK/data.json", { cache: "no-store" })
.then(r => {
  if (!r.ok) throw new Error("No se pudo cargar data.json");
  return r.json();
})
.then(j => {
  console.log("DATA CARGADA:", j);
  data = j;
  render();
})
.catch(err => {
  console.error("ERROR:", err);
  alert("No se pudo cargar data.json");
});

/* RENDER SIMPLE (para comprobar que funciona) */
function render(){
  const app = document.getElementById("app");
  app.innerHTML = "";

  Object.keys(data).forEach(section => {
    let html = `<h2>${section}</h2><div style="display:flex;gap:10px;flex-wrap:wrap;">`;

    data[section].forEach(item => {
      html += `
      <div style="background:#1e293b;padding:10px;border-radius:10px;width:150px;text-align:center;">
        <img src="/ROMDOCK/${item.img}" style="max-width:100%;height:80px;object-fit:contain;" onerror="this.src='/ROMDOCK/img/default.png'">
        <div>${item.name}</div>
      </div>`;
    });

    html += "</div>";
    app.innerHTML += html;
  });
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
