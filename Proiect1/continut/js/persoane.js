function incarcaPersoane() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {

      if (this.readyState === 4 && this.status === 200) {

        const xmlDoc = this.responseXML;
        const table = document.createElement("table");
        const headerRow = table.insertRow();

        headerRow.insertCell().innerHTML = "Nume";
        headerRow.insertCell().innerHTML = "Prenume";
        headerRow.insertCell().innerHTML = "Varsta";
        headerRow.insertCell().innerHTML = "Adresa";
        headerRow.insertCell().innerHTML = "Liceu";
        headerRow.insertCell().innerHTML = "Studii Superioare";
        headerRow.insertCell().innerHTML = "Detalii Pisica";

        const persoane = xmlDoc.getElementsByTagName("persoana");

        for (let i = 0; i < persoane.length; i++) {
          const persoana = persoane[i];
          const nume = persoana.getElementsByTagName("nume")[0].childNodes[0].nodeValue;
          const prenume = persoana.getElementsByTagName("prenume")[0].childNodes[0].nodeValue;
          const varsta = persoana.getElementsByTagName("varsta")[0].childNodes[0].nodeValue;
          const strada = persoana.getElementsByTagName("strada")[0].childNodes[0].nodeValue;
          const numar = persoana.getElementsByTagName("numar")[0].childNodes[0].nodeValue;
          const localitate = persoana.getElementsByTagName("localitate")[0].childNodes[0].nodeValue;
          const judet = persoana.getElementsByTagName("judet")[0].childNodes[0].nodeValue;
          const tara = persoana.getElementsByTagName("tara")[0].childNodes[0].nodeValue;
          const adresa = `str. ${strada} nr. ${numar}, loc. ${localitate}, jud. ${judet}, ${tara}`;
          const liceu = persoana.getElementsByTagName("liceu")[0].childNodes[0].nodeValue;
          const studiiSuperioare = persoana.getElementsByTagName("studiiSuperioare")[0].childNodes[0].nodeValue;
          const numeP = persoana.getElementsByTagName("numeP")[0].childNodes[0].nodeValue;
          const varstaP = persoana.getElementsByTagName("varstaP")[0].childNodes[0].nodeValue;
          const rasa = persoana.getElementsByTagName("rasa")[0].childNodes[0].nodeValue;
          const sex = persoana.getElementsByTagName("sex")[0].childNodes[0].nodeValue;
          const detaliiP = `rasa: ${rasa}, nume: ${numeP}, varsta: ${varstaP}, Sex: ${sex}`;

          const row = table.insertRow();

          row.insertCell().innerHTML = nume;
          row.insertCell().innerHTML = prenume;
          row.insertCell().innerHTML = varsta;
          row.insertCell().innerHTML = adresa;
          row.insertCell().innerHTML = liceu;
          row.insertCell().innerHTML = studiiSuperioare;
          row.insertCell().innerHTML = detaliiP;
        }

        const contentDiv = document.querySelector(".altContent");
        contentDiv.innerHTML = "";
        contentDiv.appendChild(table);
      }
    };
    xhttp.open("GET", "resurse/persoane.xml", true);
    xhttp.send();
  }
  