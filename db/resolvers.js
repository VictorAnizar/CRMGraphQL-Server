const Usuario = require('../models/Usuario');



// Resolvers
const resolvers = {
    Query: {
        obtenerCurso: ()=>"HolaMundo"
    },
    Mutation: {
        nuevoUsuario: async (_, {input})=>{


            const {email, password} = input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email});
            console.log(existeUsuario);


            if(existeUsuario){
                throw new Error('El usuario ya está registrado') 
            }

            // Hashear la pass

            // Guardarlo en la BD
            try {
                const usuario = new Usuario(input);
                usuario.save;
                return usuario;
            } catch (error) {
                console.log(error);
            }
        }
    }
}

// Por default, el resolver tiene 4 parametros:
// 1. Resultados retornados por el resolver padre, sirve para consultas anidadas
// 2. El input como tal o los argumentos
// 3. Context. Es un objeto que se comparte entre todos los resolvers, puede servir para autentificacion
// 4. Info. Tiene informacion sobre la consulta actual.

module.exports = resolvers;
