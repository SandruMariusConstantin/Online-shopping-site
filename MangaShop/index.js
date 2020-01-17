
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var mongooselocal = require("passport-local-mongoose");
var flash = require('express-flash')

mongoose.connect("mongodb://localhost/baza_date", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: true, useNewUrlParser: true }));
app.use(methodOverride("_method"));

var admin = {nume:"admin", parola:"admin"};
var esteAdmin = false;

var SchemaUser = new mongoose.Schema({
  username: String,
  password: String,
  admin: Boolean
});

SchemaUser.plugin(mongooselocal);
var User = mongoose.model("User", SchemaUser);

var ProdusSchema = new mongoose.Schema({
  nume: String,
  pret: Number,
  imagine: String,
  promotie: Boolean,
  cos: Boolean,
  stare: Boolean
});

var produse = mongoose.model("produse", ProdusSchema);

var RecenzieSchema = new mongoose.Schema({
  Intrebare1: Boolean,
  Intrebare2: Boolean,
  Intrebare3: Boolean,
  Intrebare4: Boolean,
  Intrebare5: Boolean
});

var recenzii = mongoose.model("recenzii", RecenzieSchema);

var ComandaSchema = new mongoose.Schema({
  nume: String,
  prenume: String,
  telefon: String,
  email: String,
  adresa: String,
  suma: Number,
  numar: String,
  data: String 
});

var comenzi = mongoose.model("comenzi", ComandaSchema);

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Platon",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));






app.get('/', function (req, res) {
  produse.find({ stare: true }, function (err, produse) {
    res.render("index.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get('/Produse', function (req, res) {
  produse.find({}, function (err, produse) {
    res.render("Produse.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get("/SNA", function (req, res) {
  produse.find({}).sort({ nume: 'desc' }).exec(function (err, produse) {
    res.render("Produse.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get("/SND", function (req, res) {
  produse.find({}).sort({ nume: 'asc' }).exec(function (err, produse) {
    res.render("Produse.ejs", { produse: produse, esteAdmin: esteAdmin });
  });

});

app.get("/SPA", function (req, res) {
  produse.find({}).sort({ pret: 'asc' }).exec(function (err, produse) {
    res.render("Produse.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get("/SPD", function (req, res) {
  produse.find({}).sort({ pret: 'desc' }).exec(function (err, produse) {
    res.render("Produse.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get('/activeaza/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { stare: true }, function (err, response) {
    res.redirect('/Produse');
  });
});

app.get('/dezactiveaza/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { stare: false }, function (err, response) {
    res.redirect('/Produse');
  });
});

/* app.get('/sterge/:id', function(req, res){
  produse.findByIdAndRemove(req.params.id, function(err, response){
    res.redirect('/Produse');
  });
}); */

app.post('/produs_add', function (req, res) {
  var produsInfo = req.body;
  var mesajDeTrimis = ["", ""];

  if (!produsInfo.nume || !produsInfo.pret || !produsInfo.imagine) {
    console.log("Completeaza formularul complet");
    res.redirect('/Administrare');
  } else {
    var newProdus = new produse({
      nume: produsInfo.nume,
      pret: produsInfo.pret,
      imagine: produsInfo.imagine,
      promotie: false,
      cos: false,
      stare: true
    });

    newProdus.save(function (err, produs) {

      if (err) {
        console.log("Eroare in baza de date");
        res.redirect('/Administrare');
      } else {
        console.log("Produs salvat");
        res.redirect('/Administrare');
      }
    });
  }
});

app.get('/adauga/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { cos: true }, function (err, response) {
    res.redirect('/CosulMeu');
  });
});

app.get('/scoate/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { cos: false }, function (err, response) {
    res.redirect('/CosulMeu');
  });
});

app.get('/activeaza_promotie/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { promotie: true }, function (err, response) {
    res.redirect('/promotii');
  });
});

app.get('/dezactiveaza_promotie/:id', function (req, res) {
  produse.findByIdAndUpdate(req.params.id, { promotie: false }, function (err, response) {
    res.redirect('/promotii');
  });
});


comenzi.find({}, function (err, produse) {
  console.log(produse);
});

app.get('/index', function (req, res) {
  produse.find({ stare: true }, function (err, produse) {
    res.render("index.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get('/Administrare', function (req, res) {
  recenzii.find({}, function (err, recenzie) {
      comenzi.find({}, function (err, comanda) {
      res.render('Administrare', {recenzii: recenzie, comenzi: comanda });
    });
  });
});

app.get('/Contact', function (req, res) {
  res.render('Contact', { esteAdmin: esteAdmin });
});

app.get('/detalii_produs/:id', function (req, res) {
  produse.findById(req.params.id, function (err, produs) {
    app.set('data', produs);
    res.redirect('/detalii_produs');
  });
});

app.get('/detalii_produs', function (req, res) {
  res.render('detalii_produs.ejs', { produs: app.get('data'), esteAdmin: esteAdmin });
});

app.get('/CosulMeu', function (req, res) {
  produse.find({ cos: true }, function (err, produse) {
    res.render("CosulMeu.ejs", { produse: produse, esteAdmin: esteAdmin, cantitate: {} });
  });
});

app.post('/CosulMeu', function (req, res) {
  var cantitati = req.body.cantitate;
  app.set('data', cantitati);
  produse.find({ cos: true }, function (err, produse) {
    for(var i = 0; i < produse.length; i++)
      if(!cantitati[i])
        cantitati[i] = 1;
    res.render("CosulMeu.ejs", { produse: produse, esteAdmin: esteAdmin, cantitate: cantitati });
  });
});

app.get('/Logare', function (req, res) {
  res.render('Logare', { esteAdmin: esteAdmin, message: "", tip_mesaj: "" });
});

app.get('/Plata', function (req, res) {
  res.render('Plata', { esteAdmin: esteAdmin, message: "", tip_mesaj: "" });
});

app.post('/platestee', function (req, res) {
  console.log(req.body);

  var comandaInfo = req.body;
  var sumaTotala = 0;
  var numarProduse = 0;
  var cantitati = app.get('data');
  if (cantitati == null) {

    produse.find({ cos: true }, function (err, produse) {
      for (var i = 0; i < produse.length; i++) {
        console.log(produse[i].pret);
        sumaTotala = sumaTotala + produse[i].pret;
        numarProduse = numarProduse + 1;
      }

      if (!comandaInfo.nume || !comandaInfo.prenume || !comandaInfo.telefon || !comandaInfo.email || !comandaInfo.adresa) {
        res.render('Plata', {
          esteAdmin: esteAdmin,
          message: "Completeaza formularul complet", tip_mesaj: "error"
        });
      } else {
        var newComanda = new comenzi({
          nume: comandaInfo.nume,
          prenume: comandaInfo.prenume,
          telefon: comandaInfo.telefon,
          email: comandaInfo.email,
          adresa: comandaInfo.adresa,
          suma: sumaTotala,
          numar: numarProduse,
          data: Date()
        });

        newComanda.save(function (err, comanda) {

          if (err)
            res.render('Plata', { esteAdmin: esteAdmin, message: "Eroare in baza de date, poate nu ai nimic in cos", tip_mesaj: "error" });
          else
            res.render('Plata', { esteAdmin: esteAdmin, message: "Comanda finalizata", tip_mesaj: "success" });
        });
      }
    });
  } else {
    produse.find({ cos: true }, function (err, produse) {
      for (var i = 0; i < produse.length; i++) {
        console.log(cantitati[i]);
        console.log(produse[i].pret);
        sumaTotala = sumaTotala + produse[i].pret * parseInt(cantitati[i]);
        numarProduse = numarProduse + parseInt(cantitati[i]);
      }

      if (!comandaInfo.nume || !comandaInfo.prenume || !comandaInfo.telefon || !comandaInfo.email || !comandaInfo.adresa) {
        res.render('Plata', {
          esteAdmin: esteAdmin,
          message: "Completeaza formularul complet", tip_mesaj: "error"
        });
      } else {
        var newComanda = new comenzi({
          nume: comandaInfo.nume,
          prenume: comandaInfo.prenume,
          telefon: comandaInfo.telefon,
          email: comandaInfo.email,
          adresa: comandaInfo.adresa,
          suma: sumaTotala,
          numar: numarProduse,
          data: Date()
        });

        newComanda.save(function (err, comanda) {

          if (err)
            res.render('Plata', { esteAdmin: esteAdmin, message: "Eroare in baza de date, poate nu ai nimic in cos", tip_mesaj: "error" });
          else
            res.render('Plata', { esteAdmin: esteAdmin, message: "Comanda finalizata", tip_mesaj: "success" });
        });
      }
    });
  }
});

app.get('/promotii', function (req, res) {
  produse.find({ promotie: true, stare: true }, function (err, produse) {
    res.render("promotii.ejs", { produse: produse, esteAdmin: esteAdmin });
  });
});

app.get('/Recenzii', function (req, res) {
  res.render('Recenzii', { esteAdmin: esteAdmin, message: "", tip_mesaj: "" });
});

app.post('/logaree', function(req, res){
  var logareInfo = req.body;
  console.log(req.body);

  if(!logareInfo.nume || !logareInfo.parola) {
    res.render('Logare', {
      esteAdmin: esteAdmin,
      message: "Completeaza formularul", tip_mesaj: "error"
    });
  } else {
    if(logareInfo.nume == admin.nume && logareInfo.parola == admin.parola) {
      esteAdmin = true;
      res.render('Logare', {
        esteAdmin: esteAdmin,
        message: "Bine ai venit domnul Admin", tip_mesaj: "success"
      });
    } else {
      res.render('Logare', {
        esteAdmin: esteAdmin,
        message: "Nu esti admin", tip_mesaj: "error"
      });
    }
  } 
});

app.get('/delogaree', function (req, res) {
  esteAdmin = false;
  res.redirect("/index");
});

app.post('/recenzie_add', function (req, res) {
  var recenzieInfo = req.body;

  if (!(recenzieInfo.Intrebare1 || recenzieInfo.Intrebare11) || !(recenzieInfo.Intrebare2 || recenzieInfo.Intrebare22) ||
    !(recenzieInfo.Intrebare3 || recenzieInfo.Intrebare33) || !(recenzieInfo.Intrebare4 || recenzieInfo.Intrebare44) || !(recenzieInfo.Intrebare5 || recenzieInfo.Intrebare55)) {
    res.render('Recenzii', {
      esteAdmin: esteAdmin,
      message: "Completeaza formularul", tip_mesaj: "error"
    });
  } else {
    var newRecenzie = new recenzii({
      Intrebare1: Boolean,
      Intrebare2: Boolean,
      Intrebare3: Boolean,
      Intrebare4: Boolean,
      Intrebare5: Boolean
  });
  

    if (recenzieInfo.Intrebare1)
      newRecenzie.Intrebare1 = true;
    else
      newRecenzie.Intrebare1 = false;

    if (recenzieInfo.Intrebare2)
      newRecenzie.Intrebare2 = true;
    else
      newRecenzie.Intrebare2 = false;

    if (recenzieInfo.Intrebare3)
      newRecenzie.Intrebare3 = true;
    else
      newRecenzie.Intrebare3= false;

    if (recenzieInfo.Intrebare4)
      newRecenzie.Intrebare4 = true;
    else
      newRecenzie.Intrebare4 = false;

    if (recenzieInfo.Intrebare5)
      newRecenzie.Intrebare5 = true;
    else
      newRecenzie.Intrebare5 = false;


    newRecenzie.save(function (err, recenzie) {

      if (err)
        res.render('Recenzii', { esteAdmin: esteAdmin, message: "Eroare in baza de date", tip_mesaj: "error" });
      else
        res.render('Recenzii', { esteAdmin: esteAdmin, message: "Recenzia salvata", tip_mesaj: "success" });
    });
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});

