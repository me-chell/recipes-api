const dotEnv = require('dotenv')
dotEnv.config()

const cors = require('cors')
const db = require('./database')
const express = require('express')
const PORT = process.env.PORT || 3000
const { Sequelize } = require('sequelize')
const { ApolloServer } = require('apollo-server-express')

//? Express Server
const app = express()
app.use(cors())
app.use(express.json())

//? Apollo Server
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')
const { verifyUser } = require('./helper/context')
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    await verifyUser(req)
    return { email: req.email, loggedInUserId: req.loggedInUserId }
  },
  formatError: error => ({ message: error.message })
})
apolloServer.applyMiddleware({ app, path: '/graphql' })

//? Dummy route
app.use('/', (req, res, next) => res.send('Hello Puzzle'))

//? SERVER
const port = process.env.PORT || 3000
const server = async () => {
  try {
    await db.authenticate()
    console.log(`Postgres: http://${db.config.host}:${db.config.port}`)
    await app.listen(port)
    console.log(`Express: http://localhost:${port}`)
    console.log(`Apollo: http://localhost:${port}${apolloServer.graphqlPath}`)
  } catch (error) {
    console.log(error)
  }
}
server()
