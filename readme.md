
# Query

Para tener un servidor de graphQL se requere de mínimo un query, un schema y un resolver.
Un query permite leer los registros.
Si comparamos con las operaciones CRUD, el query sería el READ.
Equivale a un select de SQL, o una petición GET de una REST API.

Se declaran qué campos o datos se van a requerir para la consulta y también soporta parámetros (INPUT)

Es universal, es decir, la sintaxis es la misma para REACT, VUE, etc.

Ejemplo:
```
query{
    obtenerProductos{
        id
        nombre
        precio
        stock
    }
}
```

# Mutation

Sirven para las otras 3 acciones del CRUD: CREATE, UPDATE DELETE.
Similar a peticiones PUT/PATCH, DELETE O POST de una REST API.
Similar a DELEE, UPDATE E INSERT de SQL.

Es universal, es decir, la sintaxis es la misma para REACT, VUE, etc.

Ejemplo: 
```
mutation eliminarProducto($id: ID){
    eliminarProducto(id: $id)
}
{
    "data": {
        "eliminarProducto": "Se eliminó correctamente"
    }
}
```

# Schema
Es lo que describe los tipos de objeto, queries o datos de la aplicación
QUery es el único obligatorio en el schema

El schema en GraphQL utiliza un typing en el que se define si un campo será de tipo String, Int, Boolean u otro tipo de dato

Se relaciona mucho con el resolver. 

El schema define la forma de los datos mientras que el resolver se encarga de la comunicación con el lenguaje del servidor y la base de datos.

Ejemplo:
```
type Cliente{
    id: ID
    nombre: String
    apellido: String
    empresa: String
    emails: [Email]
    edad: Int
}

type Email{
    email: String
}
```

# Resolver

Son funciones que son responsables de retornar los valores que existen en el schema.

Se encarga de consultar la base de datos y traer el resultado.

Queries y mutations por sí solos, no hacen mucho. Requieren un backend para realizar las operaciones en la base de datos. Ese backend son los resolvers.

Los nombres de los resolvers deben de ser iguales a los definidos en el schema.

Ejemplo
```
obtenerClientes: async ()=>{
    const clientes = await Clientes.find({});
    return clientes;
}
```