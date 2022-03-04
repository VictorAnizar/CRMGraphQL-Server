const Usuario = require('../models/Usuario');

const bcryptjs = require('bcryptjs');

const jwt = require('jsonwebtoken');

const creatToken=(usuario, secreta, expiresIn)=>{
    console.log(usuario);
    const {id, email, nombre, apellido} = usuario;
    return jwt.sign( {id, nombre, apellido}, secreta, { expiresIn } );
}

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
            // console.log(existeUsuario);


            if(existeUsuario){
                throw new Error('El usuario ya está registrado') 
            }

            // Hashear la pass

            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            //  Guardarlo en la BD
            try {
                const usuario = new Usuario(input);
                console.log(usuario);
                usuario.save();
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, {input})=>{
            const { email, password } = input;
            
            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si la pass es correcta
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('Contraseña incorrecta');
            }
            // Crear el token
            return {
                // El token requiere:
                // 1) Qué info se va a guardar en el token
                // 2) Palabra secreta
                // 3) Tiempo de expiración
                token: creatToken(existeUsuario, process.env.SECRETA, '24h')
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
