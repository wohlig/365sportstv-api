/**
 * Define Middle Ware Here
 * import bodyParser from 'body-parser'
 */

const moment = require("moment")

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
        console.log("><><><><", req.headers.authorization)
        var decoded
        try {
            // decoded = await jwtDecode(req.headers.accesstoken)
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            console.log(req.user)
            if (req.user.userType === "Admin") {
                console.log("1")
                next()
            } else {
                console.log("2")
                res.status(401).send("Not Authorized")
            }
        } catch (e) {
            console.error(e)
            res.status(401).send(e)
        }
    } else {
        console.log(">>>>>>>>>", req.headers.authorization)
        res.status(401).send("Not Authorized")
    }
}
global.authenticateMaster = async (req, res, next) => {
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
            } else if (req.user.userType === "Master") {
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
global.verifySubscribedUser = async (req, res, next) => {
    if (req && req.headers && req.headers.authorization) {
        var decoded
        try {
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            if (
                req.user &&
                req.user.currentPlan &&
                moment(req.user.currentPlan.endDate).utcOffset("+05:30") >=
                    moment().utcOffset("+5:30")
            ) {
                next()
            } else {
                res.status(404).send("Not Subscribed")
            }
        } catch (e) {
            console.error(e)
            res.status(401).send(e)
        }
    } else {
        res.status(401).send("Not Authorized")
    }
}
