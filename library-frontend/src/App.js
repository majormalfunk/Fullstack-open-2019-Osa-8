import React, { useState } from 'react'
import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    value
  }
}
`

const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
    id
  }
}
`

const UPDATE_AUTHOR = gql`
mutation updateAuthor($name: String!, $born: Int!) {
  editAuthor (
    name: $name,
    setBornTo: $born
  ) {
    name
    born
    bookCount
    id
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks {
    title
    author {
      name
      born
      bookCount
    }
    published
    genres
    id
  }
}
`
const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String]) {
  addBook (
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
      born
      bookCount
    }
    published
    genres
    id
  }
}
`

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const handleError = (error) => {
    setErrorMessage(error.message.replace('GraphQL error:', ''))
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const login = useMutation(LOGIN, {
    onError: handleError
  })
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }
  const authorResult = useQuery(ALL_AUTHORS)
  const addBook = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })
  const bookResult = useQuery(ALL_BOOKS)
  const editAuthor = useMutation(UPDATE_AUTHOR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {(token ? <button onClick={() => setPage('add')}>Add book</button> : null)}
        {(token ? <button onClick={() => logout()}>Logout</button> : null)}
      </div>

      <div>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      </div>

      <LoginForm login={login} setToken={(token) => setToken(token)}
        show={!token} handleError={handleError}  />

      <Authors result={authorResult} editAuthor={editAuthor}
        show={page === 'authors'} handleError={handleError}
      />

      <Books result={bookResult}
        show={page === 'books'}
      />

      <NewBook addBook={addBook}
        show={page === 'add'} handleError={handleError}
      />

    </div>
  )
}

export default App