class Produs{
    constructor(id, nume, cantitate, um) {
      this.id = id;
      this.nume = nume;
      this.cantitate = cantitate;
      this.um = um;
    }
  }

function addProd(){

  var t = document.getElementById("cumparaturi");
  const worker = new Worker("/js/worker.js");
    
  var pozitie = t.rows.length;
  var row = t.insertRow(pozitie);

  var produs = document.getElementById('numeProd').value;
  var cantitate = document.getElementById('cantProd').value;
  var umP = document.getElementById('umP').value;
  var id = pozitie;
    

  const p = new Produs(id, produs, cantitate, umP);
  localStorage.setItem(p.id, JSON.stringify(p));

  console.log("A fost apasat butonul Adauga.");
  worker.postMessage("start");

  var c = row.insertCell(0);
  c.innerHTML = pozitie;

  c = row.insertCell(1);
  c.innerHTML = p.nume;

  c = row.insertCell(2);
  c.innerHTML = p.cantitate;

  c = row.insertCell(3);
  c.innerHTML = p.um;

  worker.onmessage = function(event) {
    console.log('Mesaj de la worker', event.data);
  };  

}

