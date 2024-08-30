function data_timp_curent(){
	setInterval(data_timp_curent, 1000);
	var currentdate = new Date(); 
	var data = currentdate.getDate() + "/"
				+ (currentdate.getMonth()+1)  + "/" 
				+ currentdate.getFullYear() + "  ~  "  
	
	const oraCurenta = new Date();

	if(window.document.getElementById('p1')){
		window.document.getElementById('p1').innerHTML = data + oraCurenta.toLocaleTimeString();
	}
}

function ulr_det(){
	window.document.getElementById("p2").innerHTML = window.location.href; 
}

function getLocation() {
	if (window.navigator.geolocation) {
	  window.navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		window.document.getElementById("p3").innerHTML = "Localizarea nu este suportată de acest browser.";
	}
}
  
function showPosition(position) {
	window.document.getElementById("p3").innerHTML = "<strong>Latitudine: </strong>" + position.coords.latitude +
	"<br><strong>Longitudine: </strong>" + position.coords.longitude;
}

function N_V_Browser(){
	var name = window.navigator.appName;
	var version = window.navigator.appVersion;

   window.document.getElementById("p4").innerHTML = "<strong>Nume: </strong> " + name + "<br><strong>Versiune:</strong> " + version
}

function sisOp(){
	var OSName = "Necunoscut";
	if (window.navigator.userAgent.indexOf("Windows NT 10.0")!= -1) OSName="Windows 10";
	if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1) OSName="Windows 8.1";
	if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName="Windows 8";
	if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName="Windows 7";
	if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName="Windows Vista";
	if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName="Windows XP";
	if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName="Windows 2000";
	if (window.navigator.userAgent.indexOf("Mac")            != -1) OSName="Mac/iOS";
	if (window.navigator.userAgent.indexOf("X11")            != -1) OSName="UNIX";
	if (window.navigator.userAgent.indexOf("Linux")          != -1) OSName="Linux";

	window.document.getElementById("p5").innerHTML = OSName;
}

function callAll(){
	data_timp_curent();
	ulr_det();
	getLocation();
	N_V_Browser();
	sisOp();
}

function getColor(){
	var x = window.document.getElementById("favcolor").value;
	window.document.getElementById("p6").innerHTML = x;
}

function getColor2(){
	var x = window.document.getElementById("favcolor2").value;
	window.document.getElementById("p7").innerHTML = x;
}

function Draw(){

	var sel = window.document.getElementById("ptDesen").value;

	if(sel == 0) drawRect();
	if(sel == 1) drawCircle();
}

function drawRect(){
	var c = window.document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.fillStyle = window.document.getElementById("favcolor").value;
	ctx.fillRect(10, 20, 150, 100);
	ctx.strokeStyle = window.document.getElementById("favcolor2").value;
	ctx.strokeRect(10, 20, 150, 100);
}

function drawCircle() {
	var c = window.document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	var centerX = c.width / 2;
	var centerY = c.height / 2;
	var radius = 50;

	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = window.document.getElementById("favcolor").value;
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = window.document.getElementById("favcolor2").value;
	ctx.stroke();
}

function deleteDraw(){
	var c = window.document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
}

function stergeLinie(){
	var x = window.document.getElementById("myTable");
	var l = window.document.getElementById("stergeL").value;

	if (l == "" || l == null)
		l = 0;

	x.deleteRow(l);
}

function adaugaLinie(){
	var tbl = document.getElementById('myTable'); // table reference
	var l = window.document.getElementById("adaugaL").value;

	if (l == "" || l == null)
		l = tbl.rows.length;

	var row = tbl.insertRow(l);   // append table row
	row.style.backgroundColor = window.document.getElementById("colorCell").value;
	// insert table cells to the new row
	for (var i = 0; i < tbl.rows[0].cells.length; i++) {
		createCell(row.insertCell(i), document.createElement('input') , 'row');
	}
}

function createCell(cell, text, style) {
	var div = document.createElement('div'); // create DIV element
	var txt = document.createElement('input'); // create text node
	div.appendChild(txt);                    // append text node to the DIV
	div.setAttribute('class', style);        // set DIV class attribute
	div.setAttribute('className', style);    // set DIV class attribute for IE (?!)
	cell.appendChild(div);                   // append DIV to the table cell
}

function adaugaColoana(){
	var tbl = document.getElementById('myTable'); // table reference
	var c = window.document.getElementById("adaugaC").value;

	if (c == "" || c == null)
        c = tbl.rows[0].cells.length;

    // open loop for each row and insert cell at the specified index
    for (var i = 0; i < tbl.rows.length; i++) {
        createCell(tbl.rows[i].insertCell(c), document.createElement('input'), 'col');
    }

}

function schimbaContinut(numeResursa, jsFisier, jsFunctie){
	var pag = numeResursa + '.html';
	const xttp = new XMLHttpRequest();

	xttp.onreadystatechange = function(){

		if(this.readyState == 4 && this.status == 200) {
			window.document.getElementById("continut").innerHTML = this.responseText;
			
			if (jsFisier) {

				var elementScript = document.createElement('script');
				elementScript.onload = function () {
					console.log("hello");
					if (jsFunctie) {
						window[jsFunctie]();
					}
				};
				elementScript.src = jsFisier;
				document.head.appendChild(elementScript);
			} 
			else {
				if (jsFunctie) {
					window[jsFunctie]();
				}
			}
		}
	};
	xttp.open("GET", pag);
	xttp.send();
}

function verificareUser(username,parola){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "resurse/utilizatori.json", false);
	xmlhttp.send();

	var users = JSON.parse(xmlhttp.responseText);
	var user = users.find(u => u.utilizator === username);

	if(!user){
		return -1;
	}

	if(user.parola === parola){
		return 1;
	}

	return 0;

}

function verificareHTML(user,parola){
	var isVerified = verificareUser(user, parola);

	switch(isVerified){
		case -1:
			document.getElementById("stare").style.visibility="visible";
        	document.getElementById("stare").style.color = "red";
        	document.getElementById("stare").innerHTML = "Username gresit!";
			break;

		case 0:
			document.getElementById("stare").style.visibility="visible";
            document.getElementById("stare").style.color = "red";
            document.getElementById("stare").innerHTML = "Parola gresita!";
			break;

		case 1:
			document.getElementById("stare").style.visibility="visible";
            document.getElementById("stare").style.color = "green";
            document.getElementById("stare").innerHTML = "Utilizator existent!";
			break;
		
		default:
			console.log("eroare!");
	}
}

function inregistreaza(){
    const a = {
        utilizator: "",
        parola: "",
    }
    const url = "/api/utilizatori"
    a.utilizator = document.getElementById('user').value;
    a.parola = document.getElementById('pass').value;
    const userJSON = JSON.stringify(a);

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open('POST',url,true)
    xmlhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8')

	xmlhttp.onload = () => {
		if (xmlhttp.status === 200) {
			document.getElementById("okInreg").style.visibility="visible";
			document.getElementById("okInreg").style.color = "green";
			document.getElementById("okInreg").innerHTML = "Utilizator înregistrat!";
		} else {
			document.getElementById("okInreg").style.visibility="visible";
			document.getElementById("okInreg").style.color = "red";
			document.getElementById("okInreg").innerHTML = "Nu s-a putut înregistra";
		}
	  };
	  xmlhttp.send(userJSON);
}