const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = 3001

let persons = [
    {
        id: 1, name: 'Arto Hellas', number: '040-123456'
    },
    {
        id: 2, name: 'Ada Lovelace', number: '39-44-5323523'
    },
    {
        id: 3, name: 'Dan Abramov', number: '12-43-234345'
    },
    {
        id: 4, name: 'Mary Poppendieck', number: '39-23-6423122'
    },
    {
        id: 5, name: 'Poistettava', number: '39-11-1111111'
    }
]

morgan.token('post-body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return''
})

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))
app.use(express.json())

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    }
    
    else {
        response.status(404).send({ error: 'Person not found' })
    }
})

app.get('/info', (request, response) => {
    const date = new Date()
    const teksti = `<p>Phonebook has info for ${persons.length} people</p> <p>${date}</p>`
    response.send(teksti)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
    const max = 100
    let randomId
    do {
        randomId = Math.floor(Math.random() * max)
    } while (persons.some(person => person.id === randomId))
    
    return randomId
  }
  
app.post('/api/persons', (request, response) => {    
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

    if (persons.some(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    
    persons = persons.concat(person)
    console.log(person)
    response.json(person)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})