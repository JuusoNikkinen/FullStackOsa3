const mongoose = require('mongoose')


if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]


const url = `mongodb+srv://jsnikkinen:${password}@cluster0.goadz.mongodb.net/personsApp?retryWrites=true&w=majority&appName=Cluster0`


mongoose.set('strictQuery', false)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
    runScript()
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
    process.exit(1)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})



const Person = mongoose.model('Person', personSchema)


const addPerson = (name, number) => {
  const person = new Person({ name, number })
  person.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
    .catch(error => {
      console.error('error saving person:', error.message)
      mongoose.connection.close()
    })
}


const listPersons = () => {
  Person.find({})
    .then(persons => {
      console.log('phonebook:')
      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
    .catch(error => {
      console.error('error listing persons:', error.message)
      mongoose.connection.close()
    })
}

const runScript = () => {
  if (process.argv.length === 3) {
    listPersons()
  } else if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    addPerson(name, number)
  } else {
    console.log('Invalid number of arguments. Usage:')
    console.log('node mongo.js <password> [<name> <number>]')
    mongoose.connection.close()
  }
}
