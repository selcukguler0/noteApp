const connection = require("../models/databse");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require("express-session");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gmail@gmail.com',
        pass: 'pass'
    }
});

//HOME PAGE
exports.getHomePage = (req, res) => {
    const email = req.session.email;

    const sql = "SELECT * FROM notes WHERE email=?";
    connection.query(sql, [email], (err, result) => {
        if (err) throw err;
        const notes = result;

        const sqlVerified = "SELECT * FROM users WHERE email=?";
        connection.query(sqlVerified, [email], (err, result) => {
            if (err) throw err;
            console.log(result);
            res.render("index", {
                email: req.session.email,
                isAuth: req.session.isAuth,
                notes: notes,
                isVerified: result
            });

        })
    })
        
    

}
exports.postHomePage = (req, res) => {
    const note = req.body.note;
    const email = req.session.email;
    const sql = "INSERT INTO notes (email,note) VALUES (?,?)";
    connection.query(sql, [email, note], (err, result) => {
        if (err) throw err;

        res.redirect("/");
    });
}

//LOGIN
exports.getLogin = (req, res) => {
    const loginError = req.session.loginError;
    req.session.loginError = null;
    res.render("login", { error: loginError });
}
exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sql = "SELECT email,password FROM users WHERE email=?";
    connection.query(sql, [email, password], (err, result) => {

        console.log(result);
        if (!result.length > 0) {
            req.session.loginError = "Didn't find any user with this email!";
            return res.redirect("/login");

        }
        if (result[0].password != password) {
            req.session.loginError = "Password is incorrect!";
            res.redirect("/login");
        }
        if (result[0].password == password) {
            req.session.email = email;
            req.session.isAuth = true;
            res.redirect("/");
        }
    });

}

//REGISTER
exports.getRegister = (req, res) => {
    const registerError = req.session.registerError;
    req.session.registerError = null;
    console.log(registerError);
    res.render("register", { error: registerError });
}
exports.postRegister = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirmpassword;
    const sqlEmail = "SELECT email FROM users WHERE email=?"
    connection.query(sqlEmail, [email], (err, result) => {
        if (result.length > 0) {
            req.session.registerError = "This email already in use!";
            res.redirect("/register");

        } else {
            if (email && password && confirm_password) {
                if (password == confirm_password) {
                    crypto.randomBytes(32, (err, buffer) => {
                        if (err) throw err;
                        const verifyToken = buffer.toString("hex");
                        const sql = "INSERT INTO users (email,password,token,verified) VALUES (?,?,?,?)";
                        connection.query(sql, [email, password, verifyToken, false], (err, result) => {
                            if (err) throw err;

                            var mailOptions = {
                                from: 'mailertesting00@gmail.com',
                                to: 'mailertesting00@gmail.com',
                                subject: 'Verification',
                                html: `
                                <p>Email: ${email}</p>
                                <p>Username: ${password}</p>
                                <a href='http://localhost:3000/verify/${verifyToken}'>Verify</a>
                                `
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                            res.redirect("/login");
                        })


                    })

                };
                if (password != confirm_password) {
                    req.session.registerError = "Passwords not match!";
                    res.redirect("/register");
                }


            } else {
                req.session.registerError = "Please fill all fields!";
                res.redirect("/register");
            }
        }
    })
}
//CONTACT US
exports.getContactUs = (req, res) => {
    const contactSuccess = req.session.contactSuccess;
    console.log(contactSuccess);
    req.session.contactSuccess = null;
    res.render("contactus", { success: contactSuccess });
}
exports.postContactUs = (req, res) => {
    const email = req.body.email;
    const request = req.body.request;
    var mailOptions = {
        from: email,
        to: 'mailertesting00@gmail.com',
        subject: 'CONTACT',
        html: `
        <p>Email: ${email}</p>
        <p>Request: ${request}</p>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });
    req.session.contactSuccess = "Email succesfully send.";
    res.redirect("/contact-us");

}
//VERIFY
exports.Verify = (req, res) => {
    const token = req.params.token;
    console.log("Token:" + token);
    const sql = "SELECT token FROM users WHERE token=?";
    connection.query(sql, [token], (err, result) => {
        if (err) throw err;
        if (token == result[0].token) {
            const sqlVerify = "UPDATE users SET verified=? WHERE token=?";
            connection.query(sqlVerify, [true, token], (err, result) => {
                if (err) throw err;
                res.render("index", { verifyMessage: "Email succesfully verified." });

            });
        }

    });
}
//LOGUT
exports.logout = (req, res) => {
    req.session.destroy();

    res.redirect("/");
}
