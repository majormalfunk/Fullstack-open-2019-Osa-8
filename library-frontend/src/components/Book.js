import React from 'react'

const Book = ({ book, disp }) => {

  if (disp) {
    return (
      <tr>
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

export default Book