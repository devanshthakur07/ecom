
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
               <h3>Link :  ${process.env.BASE_URL}/resetPassword/${token}</h3>`,
      };
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
          console.log(error)
        }
        else {
          console.log(mailOptions);
          console.log("Mail has been sent successfully! ",info.response);
        }
      })
    
    } catch (error) {
     return error
    }
    }


module.exports = { sendResetPasswordMail }
    













