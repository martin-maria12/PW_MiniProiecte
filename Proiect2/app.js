const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session'); // Adăugat pentru utilizarea sesiunilor
const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cookieParser());
app.use(session({
    secret: 'secret-key', // Cheia secretă pentru sesiune (poate fi orice șir)
    resave: false,
    saveUninitialized: false
  }));

const port = 6789;

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului
//este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client
//(e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în
//ormat json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

const utilizatoriBlocati = new Set();
const contorFail = new Map();
// La fiecare rulare a rutei, verificăm dacă utilizatorul este autentificat și actualizăm variabila de sesiune cu proprietățile utilizatorului
app.use((req, res, next) => {
  if (req.session.utilizator) {

    res.locals.autentificat = true;
    res.locals.utilizator = req.session.utilizator;
    numeUtilizator = req.session.utilizator.nume;

    if (utilizatoriBlocati.has(numeUtilizator)) {
      res.status(403).send('Accesul este temporar blocat pentru acest utilizator.');
      return;
    }
        
  } else {
      res.locals.autentificat = false;
      res.locals.utilizator = null;
    }

  next();
});

// Verificarea pentru resursele inexistente aici
app.use((req, res, next) => {
  // Verificare dacă ruta cerută este validă
  const ruta = req.url.split('?')[0];

  const ruteValide = ['/', '/favicon.ico', '/chestionar', '/rezultat-chestionar', '/autentificare', '/verificare-autentificare', '/delogare', '/creare-db', '/inchide-db', '/inserare-db', '/afisare-produse', '/adauga-in-cos', '/vizualizare-cos', '/admin'];
  
  if (!ruteValide.includes(ruta)) {
    const numeUtilizator = req.session.utilizator ? req.session.utilizator.nume : 'Anonim';
    utilizatoriBlocati.add(numeUtilizator); // Blocăm utilizatorul temporar
    console.log(`Accesul blocat pentru utilizatorul "${numeUtilizator}"`);
    
    setTimeout(() => {
      utilizatoriBlocati.delete(numeUtilizator);
      console.log(`Deblocare utilizator "${numeUtilizator}"`);
    }, 10000); // 10 secunde

    res.status(403).send('Accesul la această resursă este restricționat.');
    return;
  }

  // Verificare dacă utilizatorul cu rolul "USER" încearcă să acceseze rutele specifice adminului
  const rolUtilizator = req.session.utilizator ? req.session.utilizator.rol : null;
  const ruteAdmin = ['/creare-db', '/inchide-db', '/inserare-db', '/admin'];
  if (rolUtilizator === 'USER' && ruteAdmin.includes(ruta)) {
    console.log(`Accesul blocat pentru utilizatorul "${numeUtilizator}" la ruta "${ruta}"`);
    
    setTimeout(() => {
      utilizatoriBlocati.delete(numeUtilizator);
      console.log(`Deblocare utilizator "${numeUtilizator}"`);
    }, 10000); // 10 secunde
    
    res.status(403).send('Accesul la această resursă este restricționat.');
    return;
  }
  next();
});

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello
//World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => {
    const data = req.session.data || [];
    const idprod = req.session.idprod || [];
    const confirmare = req.session.confirmare || [];
    res.render('index', {data, idprod, confirmare});
});

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția
//specificată

app.get('/chestionar', (req, res) => {
    fs.readFile('intrebari.json', (err, data) => {
        if (err) throw err;
        const listaIntrebari = JSON.parse(data);
        res.render('chestionar', {intrebari: listaIntrebari});
      });
    
    // în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care
//conține vectorul de întrebări
});

app.post('/rezultat-chestionar', (req, res) => {
    const raspunsuri = req.body;
    fs.readFile('intrebari.json', (err, data) => {
        if (err) throw err;
        const listaIntrebari = JSON.parse(data);
        let punctaj = 0;
        for (let i = 0; i < listaIntrebari.length; i++) {
            if (raspunsuri[i] == listaIntrebari[i].corect) {
                punctaj++;
            }
        }
        const procentajCorecte = Math.round(punctaj / listaIntrebari.length * 100);
        res.render('rezultat-chestionar', { raspunsuri, listaIntrebari, punctaj, procentajCorecte });
    });
});

app.get('/autentificare', (req, res) => {
    const mesajEroare = req.cookies.mesajEroare;
    const mesajEroare2 = req.cookies.mesajEroare2;
    res.clearCookie('mesajEroare');
    res.clearCookie('mesajEroare2');
    res.render('autentificare', { mesajEroare, mesajEroare2 });
  });
  
app.post('/verificare-autentificare', (req, res) => {
    const { utilizator, parola } = req.body;
  
    // Citim utilizatorii din fișierul utilizatori.json
    fs.readFile('utilizatori.json', (err, data) => {
      if (err) throw err;
      const listaUtilizatori = JSON.parse(data);
  
      // Căutăm utilizatorul în lista utilizatorilor
      const utilizatorGasit = listaUtilizatori.find(u => u.utilizator === utilizator && u.parola === parola);
  
      if (utilizatorGasit) {
        if(utilizatoriBlocati.has(utilizator)){
          res.cookie('mesajEroare2', 'Utilizator ' + utilizator + ' momentan blocat.', { maxAge: 5000 });
          res.redirect('/autentificare');
          return;
        }
        // Salvăm proprietățile utilizatorului în variabila de sesiune        
        req.session.utilizator = {
          nume: utilizatorGasit.nume,
          prenume: utilizatorGasit.prenume,
          rol: utilizatorGasit.rol
        };
        if(utilizatorGasit.rol == 'USER'){
          res.redirect('/');
        }
        else{
          res.redirect('/admin');
        }
      } else {

        console.log(contorFail);

        if (contorFail.has(utilizator)) {
          contorFail.set(utilizator, contorFail.get(utilizator)+1);
          if(contorFail.get(utilizator) >= 3){
            utilizatoriBlocati.add(utilizator);

            res.cookie('mesajEroare2', '3 încercări eșuate! Utilizator ' + utilizator + ' momentan blocat.', { maxAge: 5000 });
            
            setTimeout(() => {
              utilizatoriBlocati.delete(utilizator);
              contorFail.set(utilizator, 0);
              console.log(`Deblocare utilizator "${utilizator}"`);
            }, 15000); // 15 secunde
          }
        } else {
          contorFail.set(utilizator, 1);
        }
        
        res.cookie('mesajEroare', 'Utilizator sau parolă incorecte', { maxAge: 5000 });
        res.redirect('/autentificare');
      }
    });
});

app.get('/delogare', (req, res) => {
    req.session.destroy(); // Șterge sesiunea utilizatorului
    res.redirect('/autentificare');
 });

 app.get('/creare-db', (req,res) => {

  var db = new sqlite3.Database('cumparaturi.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
      console.log('S-a conectat la cumparaturi.db');

      var tabel = 'CREATE TABLE produse(id_produs INTEGER PRIMARY KEY AUTOINCREMENT, nume_produs VARCHAR(255), pret_produs NUMERIC(10))';
      if(tabel){
        console.log("Tabelul produse exista");
      }
      else{
        db.run(tabel, (err) => {
          if (err) {
            console.error(err.message);
          }
          else{
            console.log("Tabelul produse a fost creat");
          }
        });
      }
    }
  });
  res.redirect('/admin');
});

app.get('/inchide-db', (req,res) => {
  var db = new sqlite3.Database('cumparaturi.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else
    {
      db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('S-a inchis baza de date.');
      });
    }
  });
  res.redirect('/admin');
});

app.post('/inserare-db', (req, res) =>{
  const produs = req.body.pnume_de_inserat;
  const pret = req.body.ppret_de_inserat;

  var db = new sqlite3.Database('cumparaturi.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
      db.get('SELECT MAX(id_produs) AS maxId FROM produse', (err, row) => {
        if (err) {
          console.error(err);
          return;
        }
    
        const idM = row.maxId + 1;
    
        db.run('INSERT INTO produse (id_produs, nume_produs, pret_produs) VALUES (?, ?, ?)', [idM, produs, pret], (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('Inserare reușită!');
          }

        });
      });
    }  
  });
  res.redirect('/inchide-db');
});

app.get('/afisare-produse',(req,res)=>{
  console.log('afisare-produse');
  let db = new sqlite3.Database('cumparaturi.db' ,(err) => {
      if (err) {
        console.error(err.message);
      }else{
          console.log('S-a conectat la cumparaturi.db');
          const sqlite3 = require('sqlite3').verbose();
      }
    });
    db.all('SELECT * FROM produse', (err, rows) => {
      if (err) {
        console.error(err);
        
      } else {
        const data = rows;
        req.session.data=data;
        console.log(req.session.data[0].id_produs);
       res.redirect('http://localhost:6789/');
      }
    });
});

app.get('/adauga-in-cos',(req,res)=>{
  const id = req.query.id;
  const data = req.session.data || [];

  if (!req.session.idprod) {
      req.session.idprod = [];
  }
    
  req.session.idprod.push(id);

  req.session.confirmare = 'Produsul a fost adăugat în coș.'; // Mesajul de confirmare

  res.redirect('http://localhost:6789/');
});

app.get('/vizualizare-cos',(req,res)=>{
  const idprod = req.session.idprod;
  const data = req.session.data;
  
  req.session.produse = []; 

  const counts = {};

  for (const num of idprod) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  
  const idunic = (Object.keys(counts)).map(Number);//salvam index salvat in counts o singura data 
  
  for (let j = 0; j < data.length; j++) {
    if (idunic.includes(data[j].id_produs)) { //daca se afla in idunic facem prelucrari
      const prod = data[j].nume_produs;
      const p = data[j].pret_produs;
      const cant = counts[data[j].id_produs]
      req.session.produse.push({ nume: prod, cantitate: cant, sumaPret: cant * p });
    }
  }
  res.render('vizualizare-cos', { idprod, produse: req.session.produse });
});

app.get('/admin', (req, res) => {

  if (req.session.utilizator && req.session.utilizator.rol === 'ADMIN') {
    res.render('admin');
  }
});

app.listen(port, () => console.log('Serverul rulează la adresa http://localhost:' + port));