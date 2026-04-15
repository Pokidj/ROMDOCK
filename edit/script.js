let data={};

fetch("../data.json")
.then(r=>r.json())
.then(j=>{data=j; console.log(data);});
