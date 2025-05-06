const tryCatch = (func) => async (req, res, next) => {
    try {
        await func(req, res);
    } catch (error) {
        console.log(error)
        return res.status(404).send({
            status: 'error',
            data: null,
            // message: error,
        });
    }
};

module.exports = { tryCatch };
