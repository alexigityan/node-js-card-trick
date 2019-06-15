const mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)


const CardSchema = new mongoose.Schema({
  suit: 'string',
  rank: 'string',
  name: 'string'
})

CardSchema.path('name').index({ unique: true })

const Card = mongoose.model('Card', CardSchema)

module.exports = Card