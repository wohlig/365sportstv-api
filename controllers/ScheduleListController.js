const router = Router()
// create game
router.post("/create", authenticateMaster, async (req, res) => {
    try {
        const data = await ScheduleListModel.saveData(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.delete(
    "/deleteGameByAdmin/:id",
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
            const data = await ScheduleListModel.deleteData(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post("/searchAllGamesForAdmin", authenticateMaster, async (req, res) => {
    try {
        const data = await ScheduleListModel.searchAllGamesForAdmin(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.get("/getOneGameForAdmin/:id", authenticateMaster, async (req, res) => {
    try {
        const data = await ScheduleListModel.getOneGameForAdmin(req.params.id)
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
            const data = await ScheduleListModel.updateOneGameForAdmin(
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
export default router
