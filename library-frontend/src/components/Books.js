import React from 'react'

const Books = ({ show, result }) => {

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  if (result.data.allBooks) {

    const books = result.data.allBooks

    return (
      <div>
        <h2>Books</h2>
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
            {books.map(b =>
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
                <td>
                  {b.genres.map((item) => { 
                    return ( <i key={item}>[{item}] </i> )
                  })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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