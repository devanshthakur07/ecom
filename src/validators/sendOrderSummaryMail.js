const nodemailer = require("nodemailer");

const orderReceivedMail = async (email, order) => {

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    let success = await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Thank you for shopping with us!",
       html: `

    <div style="text-align:center;">
        <h1 style="font-size:22px;">Thank you for your order!</h1>
        <h2 class="customerName">Hi</h2>
        <h2>Your order has been confirmed and will be shipped soon.</h2>
        <br>
    </div>
                <h3><Please do not hesitate to contact us on if you have any questions./h3>
                <h3>Thank you for shopping with us!</h3>`,

    });
    if (success) {
      // console.log("success",success)
      return success;
    }
  } catch (error) {
    console.log("error",error)
    return error;
  }
};



module.exports = orderReceivedMail;










