const jwt = require("jsonwebtoken");

const authentication = async(req, res, next)=>{
    try {
        let token  = req.get("authorization");
        if (!token){
            return res.status(401).send(
                { 
                    status: false, 
                    message: "No token provided!"
                });
        }
        token = token.slice(7);
        
        let decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.token = token;
        req.user = decodedToken;
        next();

    } 
    catch (error) {
        return res.status(500).send({
            error: error.message
        })
    }
}

module.exports = {authentication}