const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

const bcryptjs = require('bcryptjs');

const jwt = require('jsonwebtoken');

const creatToken = (usuario, secreta, expiresIn) => {
    console.log(usuario);
    const { id, email, nombre, apellido } = usuario;
    return jwt.sign({ id, nombre, apellido }, secreta, { expiresIn });
}

// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, { }, ctx) => {
            return ctx.usuario;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({})
                return productos
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {

            // Revisar si existe el producto
            let producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('No existe el error');
            }

            return producto;


        },
        obtenerClientes: async()=>{
            try {
                let clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async(_, {}, ctx)=>{
            try {
                let clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
                return clientes;
            } catch (error) {
                console.log(error);
            }

        },
        obtenerCliente: async(_, {id}, ctx)=>{
            // Revisar si el cliente existe
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('El cliente no existe');
            }
            // Quien lo creo puede verlo
            if (cliente.vendedor.toString()!==ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            return cliente;
        },
        obtenerPedidos: async()=>{
            try {
                let pedidos = await Pedido.find({});
                return pedidos
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx)=>{
            
            try {
                let pedidos = await Pedido.find({vendedor: ctx.usuario.id.toString()})
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },obtenerPedido: async(_, {id}, ctx) => {
            // Si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Solo quien lo creo puede verlo
            if(pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            // retornar el resultado
            return pedido;
        }, 
        obtenerPedidosEstado: async (_, { estado }, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

            return pedidos;
        },
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO" } },
                { $group : {
                    _id : "$cliente", 
                    total: { $sum: '$total' }
                }}, 
                {
                    $lookup: {
                        from: 'clientes', 
                        localField: '_id',
                        foreignField: "_id",
                        as: "cliente"
                    }
                }, 
                {
                    $limit: 10
                }, 
                {
                    $sort : { total : -1 }
                }
            ]);

            return clientes;
        }, 
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO"} },
                { $group : {
                    _id : "$vendedor", 
                    total: {$sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios', 
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                }, 
                {
                    $limit: 3
                }, 
                {
                    $sort: { total : -1 }
                }
            ]);

            return vendedores;
        },
        buscarProducto: async(_, { texto }) => {
            const productos = await Producto.find({ $text: { $search: texto  } }).limit(10)

            return productos;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, { input }) => {


            const { email, password } = input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({ email });
            // console.log(existeUsuario);


            if (existeUsuario) {
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
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({ email });
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
        },
        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);
                // Almacenar en BD
                const resultado = await producto.save();

                return resultado;

            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            // Revisar si existe el producto
            const producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('No existe el error');
            }

            // Guardarlo en la BD
            // Lo actualiza en la misma linea
            producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });
            return producto;
        },
        eliminarProducto: async (_, { id }) => {
            // Revisar si existe el producto
            const producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('No existe el producto');
            }

            // eliminarlo de la BD
            await Producto.findByIdAndDelete({ _id: id });
            return "Producto eliminado";
        },
        nuevoCliente: async (_, { input }, ctx) => {

            console.log(ctx);

            const { email } = input.email;

            // Verificar si el cliente ya esta registrado 
            const cliente = await Cliente.findOne({ email });

            if (cliente) {
                throw new Error('Cliene ya registrado')
            }

            const nuevoCliente = new Cliente(input);


            // Asignar vendedor
            nuevoCliente.vendedor = ctx.usuario.id; 

            // Guardar en bd

            try {
                const resultado = await nuevoCliente.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }

        },
        actualizarCliente: async(_, {id, input}, ctx)=>{
            // Revisar si existe el cliente
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('No existe el cliente');
            }
            // Verificar que se actualiza un cliente propio
            if(cliente.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No se puede modificar un cliente que no es tuyo');
            }
            cliente = await Cliente.findByIdAndUpdate({ _id: id }, input, {new: true});
            return cliente
        },
        eliminarCliente: async(_, {id}, ctx)=>{
            // Revisar si existe el cliente
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('No existe el cliente');
            }
            // Verificar que se actualiza un cliente propio
            if(cliente.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No se puede eliminar un cliente que no es tuyo');
            }
            await Cliente.findByIdAndDelete({ _id: id });
            return 'Cliente eliminado';
        },
        nuevoPedido: async(_, {input}, ctx)=>{
            // Verificar si existe cliente

            let {cliente} = input;
            
            let clienteExiste = await Cliente.findById(cliente)

            if(!clienteExiste){
                throw new Error('No existe el cliente');
            }

            // Verifica si el cliente es del vendedor
            if(clienteExiste.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No se tiene acceso');
            }

            // Verificar que el stock este disponible
            for await(const articulo of input.pedido) {
                const {id} = articulo;
                const producto = await Producto.findById(id);
                if (articulo.cantidad > producto.existencia) {
                    throw new Error('El articulo excede la cantidad disponible');
                }else{
                    // Restar la cantidad a lo disponible
                    producto.existencia = producto.existencia- articulo.cantidad;
                    await producto.save(); 
                }
            }


            const nuevoPedido = new Pedido(input);
            // Asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;
            // Guardarlo en la bd
            const resultado = await nuevoPedido.save();
            return resultado;
        }
    }
}

// Por default, el resolver tiene 4 parametros:
// 1. Resultados retornados por el resolver padre, sirve para consultas anidadas
// 2. El input como tal o los argumentos
// 3. Context. Es un objeto que se comparte entre todos los resolvers, puede servir para autentificacion
// 4. Info. Tiene informacion sobre la consulta actual.

module.exports = resolvers;
