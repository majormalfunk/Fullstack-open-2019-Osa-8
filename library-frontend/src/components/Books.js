import React, { useState } from 'react'
import BookList from './BookList.js'

const Books = ({ show, result }) => {

  const [selectedGenre, setSelectedGenre] = useState(null)

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  if (result.data.allBooks) {

    const buttonStyle = {
      color: "red",
      borderColor: "orange",
      margin: "5px"
    }
    const buttonStyleSel = {
      backgroundColor: "red",
      color: "white",
      borderColor: "orange",
      margin: "5px"
    }

    const books = result.data.allBooks
    let existingGenres = new Set()
    books.forEach((book) => {
      book.genres.forEach((genre) => {
        existingGenres.add(genre)
      })
    })

    const selectGenre = (genre) => {
      setSelectedGenre(selectedGenre === genre ? null : genre)
    }

    return (
      <div>
        <h2>Books in {selectedGenre === null ? 'all genres' : `genre ${selectedGenre}`}</h2>
        <BookList books={books} selectedGenre={selectedGenre} />
        <h3>Available genres</h3>
        <div>
          {Array.from(existingGenres).map((genre) => {
            return (<button key={genre} onClick={() => selectGenre(genre)}
              style={(genre === selectedGenre ? buttonStyleSel : buttonStyle)}>{genre}</button>)
          })}
        </div>
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

export default Books