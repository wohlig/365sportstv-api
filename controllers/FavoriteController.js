import { validate } from "node-cron"

const router = Router()
// create game
router.post(
    "/addOrUpdateFavorite",
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                userId: { type: "string" },
                gameId: { type: "string" },
                status: {
                    type: "string"
                }
            },
            required: ["userId", "gameId", "status"]
        }
    }),
    authenticateUser,
    async (req, res) => {
        try {
            // const data = await FavoriteModel.saveData(req.body, req.user._id)
            const data = await FavoriteModel.saveData(req.body)

            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get("/getFavoritesForUser", verifySubscribedUser, async (req, res) => {
    try {
        const data = await FavoriteModel.getFavoritesForUser(req.user)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.post("/getFavoritesForUserInBackend", async (req, res) => {
    try {
        const data = await FavoriteModel.getFavoritesForUserInBackend(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.delete(
    "/:id",
    authenticateAdmin,
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: { type: "string", format: "objectId" }
            },
            required: ["id"]
        }
    }),
    async (req, res) => {
        try {
            const data = await FavoriteModel.deleteData(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
export default router
