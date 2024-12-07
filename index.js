require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const Person = require('./models/person')
const { nextTick } = require('process')
const app = express()


morgan.token('post-body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return''
})

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))
app.use(express.json())
app.use(express.static('dist'))
//app.use(express.static(path.join(__dirname, 'dist')))
console.log('Serving static files from:', path.resolve(__dirname, 'dist'));


//Virheiden käsittely
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message})
    }
    next(error)
  }
  app.use(errorHandler)


//Kaikkien henkilöiden haku
app.get('/api/persons', (request,response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })

    .catch(error => next(error))
        
})

//Yksittäisen henkilön haku
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).send({ error: 'Person not found' })
            }
        })
        .catch(error => next(error))
    })

//Puhelinluettelossa olevien henkilöiden lukumäärä
app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            const date = new Date()
            const text = `<p>Phonebook has info for ${count} people</p><p>${date}</p>`
            response.send(text)
        })
        .catch(error => next(error))
    })

//Henkilön poistaminen
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
    .catch(error => next(error))
  })

/*   const generateId = () => {
    const max = 100
    let randomId
    do {
        randomId = Math.floor(Math.random() * max)
    } while (persons.some(person => person.id === randomId))
    
    return randomId
  }
   */

//Henkilöiden lisääminen
app.post('/api/persons', (request, response, next) => {    
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person ({
        name: body.name,
        number: body.number
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

//Olemassa olevan henkilön päivitys
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
        Person.findByIdAndUpdate(request.params.id, person, {
            new: true,
            runValidators: true,
            context: 'query' })
                .then(updatedPerson =>{
                    response.json(updatedPerson)
                })
                .catch(error => next(error))
            })

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})
            

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})