// Resolvers
const resolvers = {
    Query: {
        obtenerCurso: ()=>"HolaMundo"
    },
    Mutation: {
        nuevoUsuario: ()=>"Creando nuevo usuario"
    }
}

// Por default, el resolver tiene 4 parametros:
// 1. Resultados retornados por el resolver padre, sirve para consultas anidadas
// 2. El input como tal o los argumentos
// 3. Context. Es un objeto que se comparte entre todos los resolvers, puede servir para autentificacion
// 4. Info. Tiene informacion sobre la consulta actual.

module.exports = resolvers;
