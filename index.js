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
    db.query("SELECT * FROM product;", (error, data) => {
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
        return res.json({ status: true });
    });
});

// Requête pour ajouter un produit en BDD
app.post("/addProduct", (req, res, next) => {
    db.query('INSERT INTO product SET ?', req.body, (error, result) => {
            if(error) {
                return res.status(500).json({ status: "ERROR", error});
            }
            return res.json({ status: true});
        });
});

// Récupération d'un utilisateur
app.get("/getUserByMailAndPassword", (req, res, next) => {
    db.query("SELECT * FROM user WHERE mail LIKE ? AND password LIKE ?;", [req.body.mail, req.body.password], (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        if(result.length = 1){
            return res.json({ status: true });
        }
        else {
            return res.json({ status: false });
        }
    });
});


// Récup user par son ID
app.get("/getUserByID", (req, res, next) => {
    db.query("SELECT u.user_id, u.first_name, u.last_name, u.address, u.mail, u.city, u.postal_code FROM user u WHERE user_id LIKE ?", req.body.id_user, (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        if(result.length = 1){
            return res.json(result);
        }
    });
});

// Récupération des commandes pour un utilisateur
app.get("/getOrdersByUser", (req, res, next) => {
    db.query("SELECT o.id_order, o.user_id, o.total_amount, os.name as 'order_status' FROM `order` o INNER JOIN order_status os ON o.id_order_status = os.id_order_status WHERE o.user_id = 1;", req.body.user_id, (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        return res.json(result);
    });
});


// Créer une commande pour un utilisateur avec les produits associés
app.post("/createOrderForUser", (req, res, next) => {
    let sumOrder = 0;
    if(req.body.products.length > 1){
        for(let i = 0; i < req.body.products.length; i++){
            sumOrder += req.body.products[i].quantity * req.body.products[i].price;
        }
    } else {
        sumOrder = req.body.products[0].quantity * req.body.products[0].price;
    }

    let lastID;
    db.query("INSERT INTO `order` (user_id, total_amount, id_order_status) VALUES (?, ?, ?);",
     [req.body.user_id, sumOrder, 1], (error, result) => {
        if(error) {
            return res.status(500).json({ status: "ERROR", error});
        }
        lastID = result.insertId;
        if(req.body.products.length > 1){
            for(let i = 0; i < req.body.products.length; i++){
                db.query("INSERT INTO order_line (id_order, id_product, quantity) VALUES (?, ?, ?);",
                 [lastID, req.body.products[i].id_product, req.body.products[i].quantity], (error, result) => {
                    if(error) {
                        return res.status(500).json({ status: "ERROR", error});
                    }
                    return res.json({ status: true });
                });
            }
        } else {
            db.query("INSERT INTO order_line (id_order, id_product, quantity) VALUES (?, ?, ?);",
             [lastID, req.body.products[0].id_product, req.body.products[0].quantity], (error, result) => {
                if(error) {
                    return res.status(500).json({ status: "ERROR", error});
                }
                return res.json({ status: true });
            });
        }
    });
});

app.get("/")