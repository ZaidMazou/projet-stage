const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const port = 7000
const app = express()
const session = require('express-session')
const cookie = require('cookie-parser')
const bodyParser = require('body-parser')

// ------------------------ Middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:["http://localhost:3000"],
    methods:["POST","GET","PUT","DELETE"],
    credentials:true
}))
app.use(cookie())
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        maxAge:1000*60*60*12
    }
}))
app.use(bodyParser.json())

// ------------------------- Base de données
const db = mysql.createConnection({
    host:'localhost',
    password:'',
    user:'root',
    database:'AgenceDeTransport'
})
db.connect(err => {
    if(err) {
      console.error('Erreur de connexion à la base de données:', err);
      return;
    }
    console.log('Connecté à la base de données MySQL!');
  });
  

// --------------------------------------------------------Routes

app.get('/',(req,res)=>{
    return res.json('bienvenu sur notre api')
})
//+++++++++++++++++++++++++++ Routes connexion authentification enregistrement des utilisatuers

app.post('/login',(req,res)=>{
    const q = 'SELECT * FROM users WHERE email = ? AND motdepasse = ?'// Authentification
    db.query(q,[req.body.email,req.body.password],(err,data)=>{
        if(err)return res.json(err)
        if (data.length > 0) {
            req.session.identifiant = data[0].iduser
            req.session.admin = data[0].admin
            return res.json({
                Login:true,
                Admin:data[0].admin,
                Identifiant:req.session.identifiant
            })
        }else{
            return res.json({Login:false})
        }
    })
})


app.get('/sessionstate',(req,res)=>{ // Vérification de l'etat de la connexion
    if(req.session.identifiant){
        return res.json({
            valid:true,
            admin:req.session.admin,
            identifiant:req.session.identifiant
        })
    }else{
        return res.json({valid:false})
    }
})

app.post('/register',(req,res)=>{ // Création d'un nouvel utilisateur
    const q = 'INSERT INTO users(nom, prenom, motdepasse, email, telephone, sexe, profession, datenaissance) VALUES (?)'
    const values = [
        req.body.nom,
        req.body.prenom,
        req.body.password,
        req.body.email,
        req.body.telephone,
        req.body.sexe,
        req.body.profession,
        req.body.datenaissance,
    ]
    db.query(q,[values],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Routes administrateurs
//_________________________Les nombres des différents users compagnies etc...

app.get('/compagnies/nombre',(req,res)=>{
    const q = 'SELECT COUNT(*) as number FROM compagnie' // Le nombre de compagnies
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/users/nombre',(req,res)=>{
    const q = 'SELECT COUNT(*) as number FROM users WHERE admin = 0' // Le nombre de users
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/trajets/nombre',(req,res)=>{
    const q = 'SELECT COUNT(*) as number FROM trajet' // Le nombre de trajets
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/reservations/nombre',(req,res)=>{
    const q = 'SELECT COUNT(*) as number FROM reservation' // Le nombre de reservation
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

//___________________________________ Routes admin des Compagnies Sélection,suppression ,updating etc

app.get('/compagnies',(req,res)=>{
    const q = 'SELECT * FROM compagnie' // Sélectionne toutes les compagnies
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/compagnies/limit',(req,res)=>{
    const q = 'SELECT * FROM compagnie LIMIT 9' // Sélectionne 9 compagnies
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/compagnie/:id',(req,res)=>{
    const q = "SELECT * FROM compagnie WHERE idCompagnie = ?" //Sélectionner une compagnie dont l'identifiant est id
    const id = req.params.id
    db.query(q,[id],(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.post('/compagnies',(req,res)=>{
    const q = 'INSERT INTO compagnie (nomCompagnie,dateCreation,email,numIFU) VALUES(?)'// Ajouter une compagnie
    const values = [
        req.body.nomCompagnie,
        req.body.dateCreation,
        req.body.email,
        req.body.numIFU
    ]
    db.query(q,[values],(err,data)=>{
        if(err)return res.json(err)
        return res.json('success')
    })
})
app.put('/compagnie/:id',(req,res)=>{
    const q = 'UPDATE compagnie set nomCompagnie = ?,dateCreation = ?,email = ?,numIFU = ? WHERE idCompagnie = ?' //Modification d'une compagnie
    const id = req.params.id
    const values = [
        req.body.nomCompagnie,
        req.body.dateCreation,
        req.body.email,
        req.body.numIFU
    ]
    db.query(q,[...values,id],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})
app.delete('/compagnie/:id',(req,res)=>{
    const q = "DELETE FROM compagnie WHERE idCompagnie = ?" //Supprimer une compagnie
    const id = req.params.id
    db.query(q,[id],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})

//______________________________________Routes admin utilisateurs

app.get('/users',(req,res)=>{
    const q = 'SELECT * FROM users'// Sélectionne tous les utilisateurs
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get('/user/limit',(req,res)=>{
    const q = 'SELECT * FROM users WHERE admin = 0 LIMIT 12' // Sélectionne 10 utilisateurs
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.delete('/user/:id',(req,res)=>{
    const q = "DELETE FROM users WHERE iduser = ?" //Supprimer un utilisateur
    const id = req.params.id
    db.query(q,[id],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})

//________________________________________ Routes des trajets et couvertures de trajets par les compagnies

app.get('/trajet/depart',(req,res)=>{
    const q = 'SELECT idTrajet,ville FROM trajet,ville WHERE trajet.idDepart = ville.idville ORDER BY idTrajet' // Trajet ville de départ
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/trajet/arrivee',(req,res)=>{
    const q = 'SELECT idTrajet,ville FROM trajet,ville WHERE trajet.idArrivee = ville.idville ORDER BY idTrajet' // Trajet ville d'arrivée
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get('/trajet/couverture',(req,res)=>{
    const q = 'SELECT id,couvrir.idCompagnie,nomCompagnie,couvrir.idtrajet,heureDepart,prix FROM compagnie,trajet,couvrir WHERE compagnie.idCompagnie=couvrir.idCompagnie AND trajet.idtrajet=couvrir.idtrajet'// couverture du trajet par une compagnie
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/trajet/couverture/limit',(req,res)=>{
    const q = 'SELECT id,couvrir.idCompagnie,nomCompagnie,couvrir.idtrajet,heureDepart,prix FROM compagnie,trajet,couvrir WHERE compagnie.idCompagnie=couvrir.idCompagnie AND trajet.idtrajet=couvrir.idtrajet LIMIT 9'// couverture du trajet par une compagnie
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.delete('trajet/couverture/delete/:id',(req,res)=>{
    const q = " DELECT FROM couvrir WHERE couvri.id = ?"
    const id = req.params.id
    db.query(q,[id],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})

//_______________________________________Routes des réservations

app.get('/reservation',(req,res)=>{
    const q = 'SELECT idReservation,users.nom,compagnie.nomCompagnie,dateReservation,reservation.idTrajet FROM users,compagnie,reservation,trajet WHERE users.iduser = reservation.iduser AND reservation.idCompagnie = compagnie.idCompagnie AND trajet.idtrajet=reservation.idtrajet'
    db.query(q,(err,data)=>{  // La liste des reservations
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.delete('/reservation/:id',(req,res)=>{
    const q = "DELETE FROM reservation WHERE idreservation = ?" //Supprimer une réservation
    const id = req.params.id
    db.query(q,[id],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})

//___________________________________________Routes des notifiacation 

app.get('/notification',(req,res)=>{
    const q = 'SELECT users.nom,compagnie.nomCompagnie,commentaire FROM users,compagnie,visiter WHERE visiter.iduser=users.iduser AND visiter.idCompagnie=compagnie.idCompagnie'
    db.query(q,(err,data)=>{ // Liste des commentaires 
        if(err) return res.json(err)
        return res.json(data)
    })
})


//++++++++++++++++++++++++++++++++++++++++++++++++++++Routes client

app.post('/submit/form',(req,res)=>{
    req.session.formData = req.body
    return res.json(req.session.formData)
})

app.get('/getdata',(req,res)=>{
    if(req.session.formData){
        res.json(req.session.formData)
    }else{
        res.send("No data in session");
    }
})

app.get('/ville/selected/:ville',(req,res)=>{
    const q = `SELECT idville FROM ville WHERE ville LIKE "%" ? "%"`//Sélectionne id d'une ville
    const ville = req.params.ville
    db.query(q,[ville],(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get('/client/trajet/:Depart/:Arrivee',(req,res)=>{
    const q =`SELECT idTrajet FROM trajet WHERE idDepart = (SELECT idville FROM ville WHERE ville LIKE "%" ? "%") AND idArrivee = (SELECT idville FROM ville WHERE ville LIKE "%" ? "%")`
    const { Depart, Arrivee } = req.params;
    db.query(q,[Depart,Arrivee],(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/client/couverture/:idTrajet',(req,res)=>{
    console.log('idTrajet:', req.params.idTrajet);
    const q = 'SELECT id,nomCompagnie,heureDepart,prix FROM compagnie,trajet,couvrir WHERE compagnie.idCompagnie=couvrir.idCompagnie AND trajet.idTrajet=couvrir.idTrajet AND couvrir.idTrajet = ?'// couverture du trajet par une compagnie
    const id = req.params.idTrajet
    db.query(q,[id],(err,data)=>{
        if(err){
            console.error('Erreur SQL:', err);
            return res.status(500).json({error: 'Erreur interne du serveur'});
        }
        return res.json(data)
    })
})

app.post('/notification',(req,res)=>{
    const q = 'INSERT INTO notification (nom,prenom,email,message) VALUES (?)'
    const values = [
        req.body.name,
        req.body.prenom,
        req.body.email,
        req.body.message
    ]
    db.query(q,[values],(err,data)=>{
        if(err) return res.json(err)
        return res.json('success')
    })
})

// ------------------------- Demarrage du server
app.listen(port,()=>{
    console.log(`le server a démarré au port ${port}`);
})