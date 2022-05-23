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
global.verifySubscribedUser = async (req, res, next) => {
    if (req && req.headers && req.headers.authorization) {
        var decoded
        try {
            const decoded = jwt.verify(
                req.headers.authorization,
                process.env["JWT_KEY"]
            )
            req.user = decoded
            console.log(
                new Date(req.user.currentPlan.endDate).toLocaleString(
                    undefined,
                    { timeZone: "Asia/Kolkata" }
                )
            )
            console.log(
                new Date().toLocaleString(undefined, {
                    timeZone: "Asia/Kolkata"
                })
            )
            if (
                req.user &&
                req.user.currentPlan &&
                new Date(req.user.currentPlan.endDate).toLocaleString(
                    undefined,
                    { timeZone: "Asia/Kolkata" }
                ) >=
                    new Date().toLocaleString(undefined, {
                        timeZone: "Asia/Kolkata"
                    })
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
