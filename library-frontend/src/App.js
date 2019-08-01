import React, { useState } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'
import Authors from './components/Authors'
import Books from './components/Books'
import Recommendations from './components/Recommendations'
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
const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
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
`

const ALL_BOOKS = gql`
{
  allBooks {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`
const CURRENT_USER = gql`
{
  me {
    username
    favoriteGenre
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
const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails  
    }
  }
  ${BOOK_DETAILS}
`

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => {
      set.map(b => b.id).includes(object.id)
    }
    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      dataInStore.allBooks.push(addedBook)
      client.writeQuery({
        query: ALL_BOOKS,
        data: dataInStore
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
      window.alert(`A new book "${addedBook.title}" by ${addedBook.author.name} was added else where!`)
    }
  })

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
    update: (store, response) => {
      updateCacheWith(response.data.addBook)
    }
    //refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })
  const bookResult = useQuery(ALL_BOOKS)
  const editAuthor = useMutation(UPDATE_AUTHOR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })
  const userResult = useQuery(CURRENT_USER)

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {(token ? <button onClick={() => setPage('add')}>Add book</button> : null)}
        {(token ? <button onClick={() => setPage('recommended')}>Recommended</button> : null)}
        {(token ? <button onClick={() => logout()}>Logout</button> : null)}
      </div>

      <div>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      </div>

      <LoginForm login={login} setToken={(token) => setToken(token)}
        show={!token} handleError={handleError} />

      <Authors result={authorResult} editAuthor={editAuthor}
        show={page === 'authors'} handleError={handleError}
      />

      <Books result={bookResult}
        show={page === 'books'}
      />

      <Recommendations result={bookResult} userResult={userResult}
        show={page === 'recommended'}
      />

      <NewBook addBook={addBook}
        show={page === 'add'} handleError={handleError}
      />

    </div>
  )
}

export default App