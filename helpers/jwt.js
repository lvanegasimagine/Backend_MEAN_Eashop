const expressJwt = require('express-jwt');

function authJwt(){
    const secret = process.env.secret;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256']
    }).unless({ // Excluye el path para que no le pida token ya que el lo esta generando
        path: [
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            '/api/v1/users/login',
            '/api/v1/users/register'
        ]
    })
}

module.exports = authJwt;