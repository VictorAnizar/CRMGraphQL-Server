const { ApolloServer, gql } = require('apollo-server');

const typeDefs = require('./db/schema');

const resolvers = require('./db/resolvers');

const conectaDB = require('./config/db');

conectaDB();

// Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen().then(({url})=>{
    console.log(`Servidor listo en ${url}`);
})