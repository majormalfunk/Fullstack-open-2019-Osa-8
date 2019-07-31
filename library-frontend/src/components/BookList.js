import React from 'react'
import Book from './Book.js'

const BookList = ({ books, selectedGenre }) => {

  return (
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
          return (
            <Book key={book.id} book={book} disp={disp} />
          )
        }
        )}
      </tbody>
    </table>
  )
}

export default BookList