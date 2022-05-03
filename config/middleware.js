/**
 * Define Middle Ware Here
 * import bodyParser from 'body-parser'
 */

/**
 * Use Middleware in Express Apps
 * app.use(bodyParser.json())
 */
global.authenticateUser = async (req, res, next) => {
    if (req && req.headers && req.headers.authorization) {
        var decoded
        try {
            // decoded = await jwtDecode(req.headers.accesstoken)
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            console.log(req.user)
            next()
        } catch (e) {
            console.error(e)
            res.status(401).send(e)
        }
    } else {
        res.status(401).send("Not Authorized")
    }
}
global.authenticateAdmin = async (req, res, next) => {
    if (req && req.headers && req.headers.authorization) {
        var decoded
        try {
            // decoded = await jwtDecode(req.headers.accesstoken)
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            if (req.user.userType === "Admin") {
                next()
            } else {
                res.status(401).send("Not Authorized")
            }
        } catch (e) {
            console.error(e)
            res.status(401).send(e)
        }
    } else {
        res.status(401).send("Not Authorized")
    }
}
global.authenticateSubscribedUser = async (req, res, next) => {
    if (req && req.headers && req.headers.authorization) {
        var decoded
        try {
            // decoded = await jwtDecode(req.headers.accesstoken)
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            next()
        } catch (e) {
            console.error(e)
            res.status(401).send(e)
        }
    } else {
        res.status(401).send("Not Authorized")
    }
}
