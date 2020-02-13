const jwt = require("jsonwebtoken");
const authConfig = require('../../config/auth.json');

module.exports =(req, res, next) => {

    const authorization = req.headers.authorization;

   
if(!authorization)
 return res.status(401).send({ error: "token não foi informado"});

  const parts = authorization.split(" ");

  if(!parts.length === 2 )
   return res.status(401).send({error: "token error"});
   
   const [scheme, token] = parts;
   
   if(!/^Bearer$/i.test(scheme))
   return res.status(401).send ({error:"token mal formatado"});
   
    jwt.verify(token, authConfig.secret, (err, decoded) =>{
    if (err) return res.status(401).send({error:"token invalido"});
    
     req.userId = decoded.id;
     return next();

    });
    
    

};
