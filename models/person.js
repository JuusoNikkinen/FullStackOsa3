const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connecting to', url)
mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

/* const personSchema = new mongoose.Schema({
    name: String,
    number: String
}) */

const puhNroValidaattori = (number) => {
  if (number.length < 8) {
    return false
  } 
  const regex = /^[0-9]{2,3}-[0-9]+$/
  return regex.test(number)
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: puhNroValidaattori,
      message: props => `${props.value} not a valid number!`
    } 
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)
module.exports = Person

//module.exports = mongoose.model('Person', personSchema)