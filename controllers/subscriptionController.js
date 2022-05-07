const router = Router()
// router.post(
//     "/create",
//     authenticateUser,
//     ValidateRequest({
//         body: {
//             type: "object",
//             properties: {
//                 plan: { type: "string", format: "objectId" },
//                 transactionId: { type: "string", format: "objectId" }
//             },
//             required: ["plan", "transactionId"]
//         }
//     }),
//     async (req, res) => {
//         try {
//             const data = await SubscriptionModel.saveData(req.body, req.user)
//             if (data.value) {
//                 res.status(200).json(data.data)
//             } else {
//                 res.status(500).json(data.data)
//             }
//         } catch (error) {
//             console.error(error)
//             res.status(500).json(error)
//         }
//     }
// )
export default router
