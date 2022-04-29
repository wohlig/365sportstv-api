import { validate } from "node-cron"

const router = Router()
// create game
router.post(
    "/create",
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                startTime: { type: "string" },
                streamId: { type: "string" },
                scoreId: { type: "string" }
            },
            required: [
                "name",
                "description",
                "startTime",
            ]
        }
    }),
    // authenticateAdmin,
    async (req, res) => {
        try {
            // const data = await GameModel.saveData(req.body, req.user._id)
            const data = await GameModel.saveData(req.body)

            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post("/searchLiveGamesLight", async (req, res) => {
    try {
        const data = await GameModel.getLiveGamesLight(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.post("/searchUpcomingGamesLight", async (req, res) => {
    try {
        const data = await GameModel.getUpcomingGamesLight(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.post("/searchPastGames", async (req, res) => {
    try {
        const data = await GameModel.getPastGames(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.get(
    "/getOneMatch/:id",
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "objectId"
                }
            }
        }
    }),
    authenticateUser,
    async (req, res) => {
        try {
            const data = await GameModel.getOne(req.params.id, req.user._id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)

router.put("/:id", async (req, res) => {
    try {
        const data = await GameModel.updateData(req.params.id, req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const data = await GameModel.deleteData(req.params.id)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
export default router
