require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

//Config DB
const DB_HOST = process.env.DB_HOST;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const db = mysql.createConnection({
    user: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    database: DB_DATABASE
});

app.listen(PORT, function() {
    console.log(`Restful API is running on PORT ${PORT}`);
   });

//Get all products from the database
app.get('/getAllProducts', (req, res) => {
    db.query("SELECT * from product;", (error, data) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        return res.json(data);
    });
});

// Requête pour crée un utilisateur en BDD
app.post("/createUser", (req, res, next) => {
    db.query('INSERT INTO user SET ?', req.body, (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        return res.json({ status: "Success" });
    });
});

// Requête pour ajouter un produit en BDD
app.post("/addProduct", (req, res, next) => {
    db.query('INSERT INTO product SET ?', req.body, (error, result) => {
            if(error) {
                return res.status(500).json({ status: "ERROR", error});
            }
            return res.json({ status: "Success" });
        });
});

app.get("/getUserByMailAndPassword", (req, res, next) => {
    db.query("SELECT * FROM user WHERE mail LIKE ? AND password LIKE ?;", [req.body.mail, req.body.password], (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        if(result.length = 1){
            console.log(result);
        }
    });
});

