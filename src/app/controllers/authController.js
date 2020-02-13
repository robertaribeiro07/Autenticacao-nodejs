const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const crypto = require("crypto");
const mailer = require('../../modules/mailer');

function generateToken(params = {}) {

   return jwt.sign(params, authConfig.secret, {
      expiresIn: 86400,
   });

}

router.post('/register', async (req, res) => {
   const { email } = req.body;

   try {

      if (await User.findOne({ email }))
         return res.status(400).send({ error: "usuário já cadastrado" });

      const user = await User.create(req.body);

      user.password = undefined;  // para enconder a senha

      return res.send({
         user,
         token: generateToken({ id: user.id }),
      });

   } catch (err) {
      return res.status(400).send({ error: 'erro de registro' });
   }

});

router.post('/autenticar', async (req, res) => {
   const { email, password } = req.body;

   const user = await User.findOne({ email }).select('+password');

   if (!user)
      return res.status(400).send({ error: "usuário não encontrado" });

   if (!await bcrypt.compare(password, user.password))
      return res.status(400).send({ error: "senha inválida" });


   user.password = undefined;
   const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400,
   });

   res.send({
      user, token: generateToken({ id: user.id }),
   });
});

router.post('/recuperar', async (req, res) => {
   const { email } = req.body;

   try {
      const user = await User.findOne({ email });

      if (!user)
         return res.status(400).send({ error: "usuario nao encontrado" });

      const token = crypto.randomBytes(20).toString("hex");

      const now = new Date();
      now.setHours(now.getHours() + 1);
      await User.findByIdAndUpdate(user.id, {
         "$set": {
            passwordResetToken: token,
            passwordResetExpires: now,
         }
      });
      //console.log(token, now);




      mailer.sendMail({
         to: email,
         from: 'robertaribeiro07@gmail.com',
         template: "auth/forgot",
         context: { token },
      }, (err) => {
         if (err)
            return res.status(400).send({ error: "nao enviado password por email" });

         return res.send();

      })

   } catch (err) {

      res.status(400).send({ error: "error de senha, tente denovo" });

   }

});

router.post('/reset', async (req, res) => {

   const { email, token, password } = req.body;

   try {
      const user = await User.findOne({ email })
         .select("+passwordResetToken passwordResetExpires");

      if (!user)
         res.status(400).send({ error: "usuário não existe" });

      if (token !== user.passwordResetToken)
         return res.status(400).send({ error: "token invalido" });


      const now = new Date();
      if (now > user.passwordResetExpires)

         return res.status(400).send({ error: "token expirou, gere um novo" });


      user.password = password;
      await user.save();


      res.send();


   } catch (err) {
      console.log(err);
      res.status(400).send({ error: "senha não resetada, tente denovo" });
   }

});

module.exports = app => app.use('/auth', router);