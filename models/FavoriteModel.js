export default {
    //create or update favorites
    saveData: async (data) => {
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
        // const data = await Favorite.find({
        //     userId: body._id,
        //     status: { $in: ["enabled"] }
        // }).populate("gameId")
        //     .sort({ createdAt: -1 })
        //     .exec()
        const data = await Game.aggregate([
            {
                $match: {
                    status: { $in: ["enabled", "disabled"] },
                    startTime: { $lte: new Date() }
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
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$userId",
                                                mongoose.Types.ObjectId(
                                                    body._id
                                                )
                                            ],
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
