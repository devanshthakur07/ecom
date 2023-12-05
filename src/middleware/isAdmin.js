const jwt = require("jsonwebtoken");

const isAdmin = async(req, res, next) => {
    let token = req.get('authorization');
    if (!token){
        return res.status(401).send(
            { 
                status: false, 
                message: "No token provided!"
            });
    }
    token = token.slice(7);
        
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(decodedToken.isAdmin) {
        next();
    }
    else{
        return res.status(401).send({
            status: false,
            message: "You're not an admin"
        })
    }
}

module.exports = {isAdmin};