require("dotenv").config();
const jwt = require("jsonwebtoken");

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            
            if (token) {
                try {
                    const payload = await jwt.verify(token, process.env.JWT_SECRET);
                    //jwt verifies the signature  and decodes the payload
                    req.user = payload;
                    next();
                } catch (jwtError) {
                    console.log('error:', jwtError.message);
                    res.status(401).json({
                        success: false,
                        error: "JWT verification failed: " + jwtError.message,
                        message: "Please login to submit the form",
                        requiresLogin: true
                    });
                }
            } else {
                console.log('No token found in header');
                res.status(401).json({
                    success: false,
                    error: "malformed auth header",
                    message: "Please login to submit the form",
                    requiresLogin: true
                });
            }
        } else {
            console.log('No authorization header');
            res.status(401).json({
                success: false,
                error: "no auth header",
                message: "Please login to submit the form",
                requiresLogin: true
            });
        }
    } catch (error) {
        console.log('Middleware error:', error.message);
        res.status(401).json({
            success: false,
            error: "Authentication failed: " + error.message,
            message: "Please login to submit the form",
            requiresLogin: true
        });
    }
};
module.exports = {
    isLoggedIn,
};