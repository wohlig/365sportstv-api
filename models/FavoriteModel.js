export default {
    //create or update favorites
    saveData: async (data) => {
        if (data.status === "enabled") {
            let count = await Favorite.countDocuments({
                userId: data.userId,
                status: "enabled"
            })
            if (count >= 4) {
                return "You can't add more than 4 favorites"
            }
        }
        let obj = await Favorite.findOneAndUpdate(
            { userId: data.userId, gameId: data.gameId },
            data,
            {
                new: true
            }
        )
        if (obj === null) {
            obj = new Favorite(data)
            await obj.save()
        }
        return obj
    },
    getFavoritesForUser: async (body) => {

        const data = await Game.aggregate([
            {
                $match: {
                    status: { $in: ["enabled"] },
                }
            },
            {
                $lookup: {
                    from: "favorites",
                    as: "favorite",
                    let: { game_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                userId: mongoose.Types.ObjectId(body._id)
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$gameId", "$$game_id"]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$favorite",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "favorite.status": { $in: ["enabled"] }
                }
            },
            {
                $project: {
                    _id: 1,
                    streamId: 1,
                    favorite: {
                        $cond: {
                            if: { $eq: ["$favorite", null] },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ["$favorite.status", "enabled"]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    favorite: true
                }
            }
        ])
        return data
    },
    deleteData: async (gameId) => {
        let obj = await Favorite.findOneAndUpdate(
            { gameId: gameId },
            { status: "archived" }
        )
        return obj
    }
}
