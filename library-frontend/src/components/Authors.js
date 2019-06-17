import React, { useState } from 'react'

const Authors = ({ show, result }) => {

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  if (result.data.allAuthors) {

    const authors = result.data.allAuthors

    return (
      <div>
        <h2>Authors</h2>
        <table>
          <tbody>
            <tr>
              <th align="left">
                Author
              </th>
              <th align="left">
                Born
              </th>
              <th align="left">
                Books
            </th>
            </tr>
            {authors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Authors