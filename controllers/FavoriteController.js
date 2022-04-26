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
router.get("/getFavoritesForUser", authenticateUser, async (req, res) => {
    try {
        const data = await FavoriteModel.getFavoritesForUser(req.user)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.delete(
    "/:id",
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                gameId: { type: "string" }
            },
            required: ["gameId"]
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
