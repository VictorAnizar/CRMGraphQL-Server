const { ApolloServer, gql } = require('apollo-server');

const typeDefs = require('./db/schema');

const resolvers = require('./db/resolvers');


// Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ()=>{
        const miContext = "Hola";
        return {
            miContext
        }
    }
});

server.listen().then(({url})=>{
    console.log(`Servidor listo en ${url}`);
})