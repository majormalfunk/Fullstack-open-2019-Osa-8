import React from 'react'
import BookList from './BookList.js'

const Recommendations = ({ show, result, userResult }) => {

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  if (result.data.allBooks && userResult) {

    const books = result.data.allBooks
    let genre = userResult.data.me.favoriteGenre

    return (
      <div>
        <h2>Recommended books in {genre === null ? 'all genres' : `your favourite genre ${genre}`}</h2>
        <BookList books={books} selectedGenre={genre} />
      </div>
    )
  } else {
    return (
      <div>
        No books
      </div>
    )
  }
}

export default Recommendations