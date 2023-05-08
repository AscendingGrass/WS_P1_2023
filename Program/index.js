const express = require('express')
const connection = require('./databases/db_words')
const app = express()
const port = 3000

const apiRouter = require('./routes/v1/words')

require('dotenv').config()
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use('/api/v1', apiRouter)

console.log('hello');

try {
    connection.authenticate()
    console.log("berhasil connect")
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
} catch (error) {
    console.error("gagal connect : ", error.message);
}
