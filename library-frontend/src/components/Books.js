import React, { useState } from 'react'

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
        <table>
          <tbody>
            <tr>
              <th align="left">
                Book
              </th>
              <th align="left">
                Author
              </th>
              <th align="left">
                Published
              </th>
              <th align="left">
                Genres
              </th>
            </tr>
            {books.map(book => {
              let disp = (selectedGenre === null)
              if (!disp) {
                book.genres.forEach((genre) => {
                  if (genre === selectedGenre) {
                    disp = true
                  }
                })
              }
              if (disp) {
                return (
                  <tr key={book.title}>
                    <td>{book.title}</td>
                    <td>{book.author.name}</td>
                    <td>{book.published}</td>
                    <td>
                      {book.genres.map((genre) => {
                        return (<i key={genre}>[{genre}] </i>)
                      })}
                    </td>
                  </tr>
                )
              } else {
                return null
              }
            }
            )}
          </tbody>
        </table>
        <h3>Genres</h3>
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