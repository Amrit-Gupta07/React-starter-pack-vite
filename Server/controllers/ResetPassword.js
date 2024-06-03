const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// reset Password token (Generate link send email)
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req body
        const email = req.body.email;

        //check if email exist
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status.json({
                success: false,
                message: 'Email is not registered .. reset password',
            })
        }
        //generate token
        // const token = crypto.randomUUID();
        const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        );
        console.log("DETAILS", updatedDetails);


        // create url
        const url = `http://localhost:3000/update-password/${token}`

        // send mail containing the url
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );
        // return response
        return res.json({
            success: true,
            message: 'Email sent successfully, check email and change password',
        })

    }
    catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong in resetting password',
            error: error.message,
        })
    }
}

// reset password(upadate in db)

exports.resetPassword = async (req, res) => {
    try {
        //data fetch
        const { password, confirmPassword, token } = req.body;

        //validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password not matching',
            });
        }

        // get userDetails from db using token
        const userDetails = await User.findOne({ token: token });

        // if no entry -invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: 'Token is invalid',
            });
        }
        //token time check
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            });
        }

        // hash
        const encryptedPassword = await bcrypt.hash(password, 10);

        // update password in db
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true },
        );

        // return response
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: '..Something went wrong in resetting password',
        });
    }
};