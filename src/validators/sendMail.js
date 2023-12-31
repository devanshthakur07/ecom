const nodemailer = require("nodemailer");


const sendResetPasswordMail = async(email, token)=>{
    try {
      const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
          user:process.env.AUTH_EMAIL,
          pass:process.env.AUTH_PASS
        }
      });
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "for reset password",
        html: `<h2>Request for change of password</h2>
               <p>Click the link to reset your password</p>
               <br/>
               <h3>Link :  ${process.env.BASE_URL}/api/auth/resetPassword/${token}</h3>
               <p>Link will expire in 10 minutes!</p>`,
      };
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
          console.log(error)
        }
        else {
          //console.log(mailOptions);
          console.log("Please check your inbox. E-mail has been sent successfully!");
        }
      })
    
    } catch (error) {
     return error
    }
    }


module.exports = { sendResetPasswordMail }
    













