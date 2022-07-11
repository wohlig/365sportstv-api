const router = Router()
router.post(
    "/searchForUser",
    authenticateUser,
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                page: { type: "number" }
            },
            required: ["page"]
        }
    }),
    async (req, res) => {
        try {
            const data = await SubscriptionModel.searchForUser(
                req.body,
                req.user
            )
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get(
    "/getTotalActiveSubscribedUsersForAdmin",
    authenticateAdmin,
    async (req, res) => {
        try {
            const data =
                await SubscriptionModel.getTotalActiveSubscribedUsersForAdmin()
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get(
    "/getTotalExpiredSubscribedUsersForAdmin",
    authenticateAdmin,
    async (req, res) => {
        console.log("IINNN")
        try {
            const data =
                await SubscriptionModel.getTotalExpiredSubscribedUsersForAdmin()
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get(
    "/getTotalActiveFreeTrialUsersForAdmin",
    authenticateAdmin,
    async (req, res) => {
        try {
            const data =
                await SubscriptionModel.getTotalActiveFreeTrialUsersForAdmin()
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get(
    "/getTotalExpiredFreeTrialUsersForAdmin",
    authenticateAdmin,
    async (req, res) => {
        console.log("IINNN")
        try {
            const data =
                await SubscriptionModel.getTotalExpiredFreeTrialUsersForAdmin()
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post(
    "/getAllSubscriptionsOfOneUserForAdmin",
    authenticateAdmin,
    async (req, res) => {
        try {
            const data =
                await SubscriptionModel.getAllSubscriptionsOfOneUserForAdmin(
                    req.body
                )
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
export default router
