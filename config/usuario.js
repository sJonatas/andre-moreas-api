require('dotenv').config();
var mongoCliente = require ('../config/db');
var mongo = require('mongodb');

async function getUsuario (_id, callback) {

  try {

    let query = {}

    if (_id != null) {
      
      query = {
        _id: new mongo.ObjectID (_id)
      }
    }
    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    let usuarios = await collection.find (query).toArray ();

    callback (usuarios)
  }
  finally {}
}

async function addUsuario (email, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.findOne ({"email": email}, (err, result) => {
      if (err) throw err

      if (result == null || result == undefined) {

        collection.insertOne ({email: email, status: 'Habilitado', tipo: 'usuario'})
        callback ({
          status: 'ok',
          message: 'O usuário foi Registrado'
        });
      }
      else {

        if (result.status == 'Desabilitado') {

          collection.updateOne ({_id: new mongo.ObjectID (result._id)}, {$set: {status: 'Habilitado'}})
          callback ({
            status: 'ok',
            message: 'O usuário foi Habilitado'
          });
        }
        else {

          callback ({
            status: 'error',
            message: 'O e-mail já está habilitado.'
          });
        }
      }
    })

  }
  finally {}
}

async function updateUsuario (_id, email, status, tipo, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.updateOne ({_id: new mongo.ObjectID (_id)}, {$set: {email: email, status: status, tipo: tipo}});
    callback ({
      status: 'ok',
      message: 'Usuário atualizado'
    });
  }
  finally {}
}

async function rmUsuario (email, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.findOne ({email: email}, (err, result) => {

      if (err) throw err

      collection.updateOne ({_id: new mongo.ObjectID (result._id)}, {$set: {status: 'Desabilitado'}})

      callback ({status: 'ok'})
    })
  }
  finally {}
}

async function cadastrar (nome, celular, email, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.findOne ({email: email, status: 'Habilitado'}, (err, result) => {

      if (err) throw err

      if (result == null || result == undefined) {

        callback ({
          status: 'error',
          message: 'O seu e-mail não se encontra na lista de alunos do André Moraes.'
        })
        return;
      }

      if (result.nome != undefined && result.nome != null) {

        callback ({
          status: 'error',
          message: 'E-mail já registrado'
        })
        return;
      }

      collection.updateOne ({_id: new mongo.ObjectID (result._id)},
                              {
                                $set: {
                                  nome: nome,
                                  celular: celular
                                }
                              })

      callback ({
        status: 'ok'
      })
    })
  }
  finally {}

}

async function checkUsuario (email, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.findOne ({email: email, status: 'Habilitado'}, (err, result) => {

      if (result == null || result == undefined) {

        callback ({
          status: 'error'
        })
        return;
      }
      else {

        if (result.hasOwnProperty ('nome') && result.nome != '') {
          callback ({
            status: 'ok',
            user: result
          });
        }
        else {
          callback ({
            status: 'error'
          })
        }
      }
    })
  }
  finally {}
}

async function checkAdm (email, callback) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.findOne ({email: email, status: 'Habilitado', tipo: 'admin'}, (err, result) => {

      if (result == null || result == undefined) {

        callback ({
          status: 'error'
        })
        return;
      }
      else {

        if (result.hasOwnProperty ('nome') && result.nome != '') {
          callback ({
            status: 'ok',
            user: result
          });
        }
        else {
          callback ({
            status: 'error'
          })
        }
      }
    })
  }
  finally {}
}

async function updateAcesso (_id, deviceId) {

  try {
    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    collection.updateOne ({_id: new mongo.ObjectID (_id)}, {
                                                            $set: {
                                                              acesso: new Date (),
                                                              device_id: deviceId
                                                            }
                                                          });
  }
  finally {}
}

async function getByEmail (email, callback) {

  try {
    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("usuarios");

    let user = await collection.findOne ({email: email}, (result) => {

      callback (result)
    })
  }
  finally {}
}

async function acessoMensal (email) {

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("acessos");

    let date = new Date ()
    date = new Date(date.toDateString())

    let acesso = await collection.findOne ({email: email, date: date}, (err, result) => {

      if (result == null) {
        collection.insertOne ({email: email, date: date})
      }
    })
  }
  finally {}
}

async function getAcessosMensais (mes, ano, callback) {

  let ini = new Date (ano + '-' + mes + '-01')
  let fim = new Date (ano + '-' + mes + '-31')

  try {

    await mongoCliente.connect();
    const collection = mongoCliente.db(process.env.DB_NAME).collection("acessos");

    let date = new Date ()
    date = new Date(date.toDateString())

    let acessos = await collection.find ({
                                          $and: [
                                            {date: {$gte: ini}},
                                            {date: {$lte: fim}}
                                          ]
                                        }).toArray ()

    callback (acessos)
  }
  finally {}
}

module.exports = {
  addUsuario,
  getUsuario,
  updateUsuario,
  rmUsuario,
  cadastrar,
  checkUsuario,
  checkAdm,
  updateAcesso,
  getByEmail,
  acessoMensal,
  getAcessosMensais
}
