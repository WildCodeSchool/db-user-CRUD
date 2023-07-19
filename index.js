const express = require('express')
const cookieParser = require('cookie-parser');
const app = express()
require('dotenv').config()
const port = 3001
app.use(express.json())
app.use(cookieParser());
const userRouter = require('./router/user')
app.use('/users', userRouter)



app.get('/', (req, res) => {
    res.send('hello from server')
})

app.listen(port, () => {
    console.log('App listen on localhost:' + port)
})