const nodemailer = require('nodemailer');
const pug =require('pug');
const { htmlToText } = require('html-to-text');

/// new Email(user,url).sendWelcome();
module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Fran Codino <${process.env.EMAIL_FROM}>`
    }
    newTransporter(){
        if(process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                service:'sendgrid',
                auth:{
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASS
                }
            });
        }
        //mailtrap transporter for development
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASS
            }
        })

    }
    async send(template, subject){
        //render template
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{ 
            subject,
            name: this.firstName,
            url: this.url
        })
        //create mailOptions
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        }

        //create transporter and send
        await this.newTransporter().sendMail(mailOptions);

    }
    async sendWelcome(){
       await this.send('welcome',`Hello ${this.firstName} welcome to our family`)
    }

    async sendResetPass(){
        await this.send('reset-pass',`Hello ${this.firstName}. Tours Reset Password Action valid for 10 minutes`)
    }
};

// const sendEmail = async(options)=>{
//     // create transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     // create email options 
    
//     // send email. 

//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;