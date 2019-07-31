require('dotenv').config()
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)

const DB_URL = process.env.DB_URL
const JWT_SECRET = process.env.JWT_SECRET

let urlToLog = `${DB_URL.substr(0, DB_URL.lastIndexOf(':'))}:*****${DB_URL.substr(DB_URL.indexOf('@'), DB_URL.length)}`
console.log('Connecting to', urlToLog, '...')

mongoose.connect(DB_URL, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    console.log('Connected to', urlToLog)
  })
  .catch((error) => {
    console.log('Error connecting to', urlToLog, ':', error.message)
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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book]
    authorCount: Int!
    allAuthors: [Author!]!
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
      let filter = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        filter.author = author.id
      }
      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }
      const filteredBooks = await Book.find({ ...filter }).populate('author')
      // console.log('allBooks, filtered', filteredBooks)
      return filteredBooks
    },
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => {
      return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {

      if (!currentUser) {
        console.log('User not authenticated while trying to add a book')
        throw new AuthenticationError('You need to login to add books', {
          invalidArgs: args
        })
      }

      console.log('addBook args:', args)

      const { title, published, author, genres } = args
      let authorId = ''
      const authorExists = await Author.findOne({ name: author })
      if (authorExists) {
        authorId = authorExists._id
        console.log('Existing author', authorId)
      } else {
        let newAuthor = new Author({ name: author })
        try {
          await newAuthor.save()
        } catch (error) {
          if (error.message.includes('name') && error.message.includes('is shorter')) {
            throw new UserInputError('Author name is too short', {
              invalidArgs: args
            })
          }
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
        authorId = newAuthor._id
        console.log('New author', authorId)
      }
      let newBook = new Book({
        title, published, author: authorId, genres
      })
      try {
        await newBook.save()
      } catch (error) {
        if (error.message.includes('title') && error.message.includes('is shorter')) {
          throw new UserInputError('Book title is too short', {
            invalidArgs: args
          })
        }
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      console.log('newBook', newBook)
      return Book.findById(newBook._id).populate('author')
    },

    editAuthor: async (root, args, { currentUser }) => {

      if (!currentUser) {
        console.log('User not authenticated while trying to edit author')
        throw new AuthenticationError('You need to login to edit author details', {
          invalidArgs: args
        })
      }

      console.log('Editing author', args.name, 'birthyear to', args.setBornTo)

      const authorExists = await Author.findOne({ name: args.name })
      if (authorExists) {
        authorExists.born = args.setBornTo
        try {
          return authorExists.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      } else {
        console.log('No such author:', args.name)
        return null
        //throw new UserInputError('No such author', { invalidArgs: args })
      }
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("Wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})