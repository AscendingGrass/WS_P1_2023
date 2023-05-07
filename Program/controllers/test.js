

module.exports = {
    test : (req, res) => {
        return res.status(200).json({message : 'ok'})
    }
}