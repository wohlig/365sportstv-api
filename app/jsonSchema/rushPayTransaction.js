module.exports = {
    id: "./errorStore",
    type: "object",
    additionalProperties: false,
    properties: {
        amount: {
            type: "number",
            required: true,
            minimum: 500,
            maximum: 5000000
        }
    }
}
