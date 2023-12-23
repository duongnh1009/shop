const commentModel = require("../../models/comment")

const comment = async(req, res) => {
    const prd_id = req.params.id;
    const {content} = req.body;
    const userSiteId = req.session.userSiteId;
    const fullNameSite = req.session.fullNameSite;
    const comments = {
        prd_id,
        userSiteId,
        fullNameSite,
        content
    }
    await new commentModel(comments).save();
    res.redirect(req.path);
}

module.exports = {
    comment
}