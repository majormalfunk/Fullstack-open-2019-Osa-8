require('dotenv').config()
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const uuid = require('uuid/v1')

mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI

console.log('Connecting to', url, '...')

mongoose.connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:'.error.message)
  })


const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book]
    authorCount: Int!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int
    ): Author
  }

`

const resolvers = {
  Author: {
    bookCount: async (root) => { 
      const books = await Book.find({ author: root._id })
      return books.length
    }
  },
  Book: {
    title: (root) => root.title,
    published: (root) => root.published,
    author: (root) => root.author,
    genres: (root) => root.genres,
    id: (root) => root.id
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log('Query allBooks')
      let filter = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        filter.author = author.id
      }
      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }
      const filteredBooks = await Book.find({ ...filter }).populate('author')
      console.log('allBooks, filtered', filteredBooks)
      return filteredBooks
    },
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => {
      console.log('Query allAuthors')
      return Author.find({})
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      console.log('addBook args:', args)
      const { title, published, author, genres } = args
      let authorId = ''
      const authorExists = await Author.findOne({ name: author })
      if (authorExists) {
        authorId = authorExists._id
        console.log('Existing author', authorId)
      } else {
        let newAuthor = new Author({ name: author })
        await newAuthor.save()
        authorId = newAuthor._id
        console.log('New author', authorId)
      }
      let newBook = new Book({
        title, published, author: authorId, genres
      })
      await newBook.save()
      //newBook.populate('author')
      console.log('newBook', newBook)
      return Book.findById(newBook._id).populate('author')
    },
    // THIS NOT WORKING YET:
    editAuthor: async (root, args) => {
      console.log('Editing author', args.name, 'birthyear to', args.setBornTo)
      const authorExists = await Author.findOne({ name: args.name })
      if (authorExists) {
        authorExists.born = args.setBornTo
        return authorExists.save()
      } else {
        console.log('No such author:', args.name)
        return null
        //throw new UserInputError('No such author', { invalidArgs: args })
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})