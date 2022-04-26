export default {
    //create game
    saveData: async (data) => {
        let obj = new Game(data)
        await obj.save()
        return obj
    },
    getLiveGamesLight: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
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
                                                    body.user
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
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
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
            }
        ])
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Game.countDocuments({
            status: { $in: ["enabled", "disabled"] },
            startTime: { $lte: new Date() }
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getUpcomingGamesLight: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const data = await Game.aggregate([
            {
                $match: {
                    status: { $in: ["enabled", "disabled"] },
                    startTime: { $gte: new Date() }
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
                                                    body.user
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
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
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
            }
        ])
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Game.countDocuments({
            status: { $in: ["enabled", "disabled"] },
            startTime: { $lte: new Date() }
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOne: async (id) => {
        return await Game.findOne({
            _id: id,
            status: { $in: ["enabled", "disabled"] }
        }).exec()
    },

    updateData: async (id, data) => {
        let obj = await Game.findOneAndUpdate({ _id: id }, data, {
            new: true
        })
        return obj
    },
    deleteData: async (id) => {
        let obj = await Game.findOneAndUpdate(
            { _id: id },
            { status: "archived" },
            {
                new: true
            }
        )
        return obj
    }
}
