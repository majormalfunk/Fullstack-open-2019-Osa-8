import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

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
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)

  const handleError = (error) => {
    setErrorMessage(error.message.replace('GraphQL error:', ''))
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const authorResult = useQuery(ALL_AUTHORS)
  const addBook = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, {query: ALL_AUTHORS }]
  })
  const bookResult = useQuery(ALL_BOOKS)
  const editAuthor = useMutation(UPDATE_AUTHOR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <div>
        {errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>}
      </div>

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