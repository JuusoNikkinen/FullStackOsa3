import { useEffect, useState } from 'react'
import personService from './services/persons'

const ShowName = ({ name, number, handleDelete }) => {
  return (
    <p>
      {name} {number}
      <button onClick={handleDelete}>delete</button>
    </p>
  )
}

const Persons = ({ personsToShow, handleDelete }) => {
  return (
    <>
      {personsToShow.map(person => (
        <ShowName
          key={person.id}
          name={person.name}
          number={person.number}
          handleDelete={() => handleDelete(person.id)}
        />
      ))}
    </>
  )
}

const PersonForm = ({ addName, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
    <form onSubmit={addName}>
      <div>
        name:
        <input
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <div>
        number:
        <input
          value={newNumber}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Filter = ({ filterName, handleFilterNameChange }) => {
  return (
    <form>
      <div>
        filter shown with
        <input value={filterName} onChange={handleFilterNameChange} />
      </div>
    </form>
  )
}

const Notification = ({ message, type }) => {
  const notificationSuccess = {
    color: 'green',
    fontSize: 16,
    padding: 10,
    backgroundColor: 'gray',
    border: 'solid green'
  }

  const notificationError = {
    color: 'red',
    fontSize: 16,
    padding: 10,
    backgroundColor: 'gray',
    border: 'solid red'
  }

  if (message === null) {
    return null
  }

  return (
    <div style={type === 'error'
    ? notificationError
    : notificationSuccess}>
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterName, setFilterName] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    console.log('effect')
    personService
      .getAll()
      .then(response => {
        console.log('promise fulfilled')
        setPersons(response.data)
      })
      .catch(error => {
        console.log('failed', error)
      })
  }, [])

  const deleteName = (id) => {
    console.log('deleting id', id)
    const person = persons.find(person => person.id === id)
    const deletedName = person.name

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .deleteName(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setMessage(`Deleted ${deletedName}`)
          setMessageType('success')
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(error => {
          console.log('failed', error)
          setMessage(`Information of ${deletedName} has already been removed from server`)
          setMessageType('error')
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const addName = (event) => {
    console.log('button clicked', event.target)
    event.preventDefault()
    if (newName.trim() === '' || newNumber.trim() === '') {
      return
    }

    const nameObject = {
      name: newName,
      number: newNumber
    }

    const person = persons.find(p => p.name === nameObject.name)
    if (person) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService
          .update(person.id, nameObject)
          .then(existingPerson => {
            
            setPersons(persons.map(p => p.id !== person.id? p : existingPerson))

            setNewName('')
            setNewNumber('')
            setMessage(`Updated ${nameObject.name}`)
            setMessageType('success')
            setTimeout(() => {
              setMessage(null)
            }, 5000)
          })
          .catch(error => {
            console.log('failed', error)
            setMessage(`Failed to update ${newName}`)
            setMessageType('error')
            setTimeout(() => {
              setMessage(null)
            }, 5000)
          })
      }
    } else {
      personService
        .create(nameObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setNewName('')
          setNewNumber('')
          setMessage(`Added ${nameObject.name}`)
          setMessageType('success')
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(error => {
          console.log('failed', error)
          setMessage(`Failed to add name ${newName}`)
          setMessageType('error')
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterNameChange = (event) => {
    setFilterName(event.target.value)
  }

  const personsToShow = filterName === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(filterName.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter filterName={filterName} handleFilterNameChange={handleFilterNameChange} />

      <h3>add a new</h3>
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons personsToShow={personsToShow} handleDelete={deleteName} />
    </div>
  )
}

export default App
