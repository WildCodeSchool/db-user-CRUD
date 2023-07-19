const express = require('express')
const router = express.Router()
const { faker } = require('@faker-js/faker');
const connection = require('../database/connection')
const jwt = require('jsonwebtoken')

// router.get('/seed', (req, res) => {
//     console.log('salut les gens')
//     for (let index = 0; index < 10; index++) {
//         const firstName = faker.person.firstName(); // Rowan Nikolaus
//         const lastName = faker.person.lastName(); // Rowan Nikolaus
//         const email = faker.internet.email(); // Kassandra.Haley@erich.biz
//         const createdAt = new Date()
//         const updatedAt = new Date()
//         const isAdmin = faker.datatype.boolean()
    
//         connection.query('INSERT INTO users (lastName, firstName, email, created_at, updated_at, is_admin) value (?, ?, ?, ?, ?, ?)', [lastName, firstName, email, createdAt, updatedAt, isAdmin], (err, results, fields) => {
//             if(!err){
//                 res.status(200).json({resultat: results})
//             }else{
//                 res.status(500).json({resultat: err})
//             }
//         })
//     }  
// })

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    console.log('token', token)
    if(!token){
     return res.sendStatus(403)
    }else{
         try {
             const data = jwt.verify(token, "YOUR_SECRET_KEY");
                 req.role = data.role
                 return next()
         } catch (error) {
             console.log(error)
         }
    }
 }

router.get('/dashboard',authorization ,(req, res) => {
    console.log('dashboard:', req.role)
    console.log(new Date())
    if(req.role !== 'admin'){
        res.sendStatus(401)
    }else{
        connection.query('SELECT * FROM USERS', (err, results, fields) => {
            if(!err){
                res.status(200).json({users: results})
            }else{
                res.status(500).json({message: err})
            }
        })
    } 
})

router.post('/signin', (req, res) => {
    const {email} = req.body
    connection.query('SELECT * FROM USERS where email= ?',[email], (err, results, fields) => {
        if(!err && results.length !== 0){
            console.log(results[0].is_admin)
            //check password ==>
            let role;
            results[0].is_admin === 1 ? role = 'admin' : role = 'basic'
            console.log('role:', role)
            const token = jwt.sign({ "iss": "JWT Course", "aud": "https://www.wildcodeschool.com/",
            "sub": "wilder@wildcodeschool.com", "role": role }, "YOUR_SECRET_KEY");
            return res
                .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                })
            .status(200)
            .json({ message: "Logged in successfully 😊 👌", user: results[0] });
        }else{
            res.status(500).json({message: err})
        }
    })
})

router.get('/logout', authorization, (req, res) => {
    return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
})

router.get('/:id', (req, res) => {
    connection.query('SELECT * FROM USERS where id= ?',[req.params.id], (err, results, fields) => {
        if(!err){
            res.status(200).json({user: results})
        }else{
            res.status(500).json({message: err})
        }
    })
})

router.post('/signup', (req, res) => {
    connection.query('INSERT INTO users (lastName, firstName, email, created_at, updated_at, is_admin) value (?, ?, ?, ?, ?, ?)', [req.body.lastName, req.body.firstName, req.body.email, new Date(), new Date(), req.body.isAdmin], (err, results, fields) => {
        if(!err){
            res.status(200).json({resultat: results})
        }else{
            res.status(500).json({resultat: err})
        }
    })
})

router.put('/:id', (req, res) => {
    connection.query('UPDATE users SET is_admin=? where id=?', [1, req.params.id], (err, results, fields) => {
        if(!err){
            res.status(200).json({user: results})
        }else{
            res.status(500).json({message: err})
        }
    })
})

router.delete('/:id', (req, res) => {
    connection.query('DELETE FROM users WHERE id=?', [req.params.id], (err, results, fields) => {
        if(!err){
            res.status(200).json({user: results})
        }else{
            res.status(500).json({message: err})
        }
    })
})


module.exports = router