const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./config')

mongoose.connect(config.DB_URL, {
  useNewUrlParser: true
})
  .then(()=>console.log('db connected'))
  .catch(err=>console.log(err))

const Card = require('./models/Card')

const app = express()

app.use(express.static(path.join(__dirname, '/public'), {
  extensions: 'html'
}))
app.use(express.urlencoded({ extended: false }))

app.post('/', (req, res)=>{
  const { name } = req.body
  if(name) {
    const formattedName = name.trim().replace(/\s+/g,'-').toLowerCase()
    res.redirect('/'+formattedName)
  } else {
    res.sendStatus(400)
  }
})

app.post('/secret', (req, res)=>{
  const { suit, rank, name } = req.body
  if (name) {
    const formattedName = name.trim().replace(/\s+/g,'-').toLowerCase()
    const newCard = new Card({ suit, rank, name: formattedName })
    newCard.save()
      .then(()=>res.sendStatus(200))
      .catch( err => {
        console.log(err)
        if (err.code === 11000) {
          res.send('<p>This name already exists!</p><a href="/secret">try another name</a>')
        } else {
          res.sendStatus(500)
        }
      })
  } else {
    res.sendStatus(400)
  }
})

app.get('/deleteall', (req, res)=>{
  Card.deleteMany({})
    .then( done => {
      res.send(`deleted ${done.deletedCount} entries`)
    })
    .catch( err => {
      console.log(err)
      res.sendStatus(500)
    })
})


app.get('/delete/:name', (req, res)=>{
  const { name } = req.params
  Card.deleteOne({ name: name.toLowerCase() })
    .then( done => {
      if(done.deletedCount === 1) {
        res.send(`found and deleted ${name}`)
      } else {
        res.send(`did not find ${name}, nothing to delete`)
      }
    })
    .catch( err => {
      console.log(err)
      res.sendStatus(500)
    })
})



app.get('/:name', (req, res)=>{
  const { name } = req.params
  Card.findOne({ name: name.toLowerCase() })
    .then( card => {
      if (card) {
        const cardText = `You saw the ${card.rank} of ${card.suit} !`
        res.send(cardText)
      } else {
        res.send('<p>I dont recognize that name... </p><a href="/">Say your name again</a>')
      }
    })
    .catch( err => {
      console.log(err)
      res.sendStatus(500)
    })
})

const PORT = process.env.PORT || 5500
app.listen(PORT, ()=>console.log(`app listens on port ${PORT}`))
