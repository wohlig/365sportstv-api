import { validate } from "node-cron"

const router = Router()
// create game
router.post(
    "/create",
    authenticateMaster,
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                startTime: {
                    type: "string"
                },
                streamId: {
                    type: "string"
                },
                scoreId: {
                    type: "string"
                }
            },
            required: ["name", "description", "startTime"]
        }
    }),

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
router.get("/searchPastGames", async (req, res) => {
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
    verifySubscribedUser,
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

router.put(
    "/:id",
    authenticateMaster,
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "objectId"
                }
            },
            required: ["id"]
        },
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                startTime: {
                    type: "string"
                },
                streamId: {
                    type: "string"
                },
                scoreId: {
                    type: "string"
                },
                status: {
                    type: "string"
                }
            }
        }
    }),
    async (req, res) => {
        try {
            const data = await GameModel.updateData(req.params.id, req.body)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.delete(
    "/:id",
    authenticateMaster,
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "objectId"
                }
            },
            required: ["id"]
        }
    }),

    async (req, res) => {
        try {
            const data = await GameModel.deleteData(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post("/searchAllGamesForAdmin", authenticateMaster, async (req, res) => {
    try {
        const data = await GameModel.searchAllGamesForAdmin(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.get("/getOneGameForAdmin/:id", authenticateMaster, async (req, res) => {
    try {
        const data = await GameModel.getOneGameForAdmin(req.params.id)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.put(
    "/updateOneGameForAdmin/:id",
    authenticateMaster,
    async (req, res) => {
        try {
            const data = await GameModel.updateOneGameForAdmin(
                req.params.id,
                req.body
            )
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.put(
    "/updateGameAndFavoriteStatus/:id",
    authenticateMaster,
    async (req, res) => {
        try {
            const data = await GameModel.updateGameAndFavoriteStatus(
                req.params.id,
                req.body
            )
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.put("/shareScreenStatus/:id", authenticateMaster, async (req, res) => {
    try {
        const data = await GameModel.shareScreenStatus(req.params.id, req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.post("/validatezoom", async (req, res) => {
    try {
        const data = await GameModel.validatezoom(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

export default router
