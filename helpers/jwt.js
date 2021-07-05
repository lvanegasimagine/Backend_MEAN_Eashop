const expressJwt = require('express-jwt');

function authJwt(){
    const secret = process.env.secret;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({ // Excluye el path para que no le pida token ya que el lo esta generando
        path: [
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            '/api/v1/users/login',
            '/api/v1/users/register'
        ]
    })
}

// si es admin lo acepta
async function isRevoked(req, payload, done) {
    if(!payload.isAdmin){
        done(null, true)
    }

    done();
}

module.exports = authJwt;