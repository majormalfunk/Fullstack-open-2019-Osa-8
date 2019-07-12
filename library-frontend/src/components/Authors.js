import React, { useState } from 'react'
import Select from 'react-select';

const Authors = ({ show, result, editAuthor }) => {

  const [author, setAuthor] = useState('')
  const [born, setBorn] = useState('')

  if (!show) {
    return null
  }

  const updateAge = async (e) => {
    e.preventDefault()

    console.log('Updating author', author.value, 'age to', born)

    let name = author.value

    await editAuthor({
      variables: { name, born }
    })

    setBorn('')
    setAuthor('')
  }

  const handleAuthorChange = (selectedAuthor) => {
    console.group('Value Changed')
    console.log(selectedAuthor.value)
    setAuthor(selectedAuthor)
    console.groupEnd()
  }

  const handleBirthYear = (year) => {
    try {
      setBorn(parseInt(year, 10))
    } catch (error) {
      setBorn()
    }
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  if (result.data.allAuthors) {

    const authors = result.data.allAuthors
    let authorNames = authors.map(a => { return { value: a.name, label: a.name } })

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
        <h2>Set birthyear</h2>
        <Select className="basic-single"
          value={author}
          classNamePrefix="select"
          name="ageSetter"
          options={authorNames}
          onChange={handleAuthorChange} />
        <div>
          Birthyear: &nbsp;
          <input onChange={({ target }) => handleBirthYear(target.value)} value={isNaN(born) ? '' : born} />
          <button onClick={updateAge} type="button">Update author</button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        No authors
    </div>
    )
  }
}

export default Authors