const nodemailer = require('nodemailer')

const mailSender = async (email, title, body) => {
    try {
        // create transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            secure : true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from : 'StudyNotion || CodeJSX - by Shubh',
            to : `${email}`,
            subject : `${title}`,
            html : `${body}` ? `${body}` : `<h6>Recieved email successfully</h6>`
        })
        console.log(info)
        return info

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = mailSender