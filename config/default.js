module.exports = {
    app: {
        port: 3001,
        static_folder: `${__dirname}/../src/public`,
        router: `${__dirname}/../src/routers/web`,
        view_folder: `${__dirname}/../src/apps/views`,
        view_engine: "ejs",
        session_key: "shop_project",
        tmp: `${__dirname}/../src/tmp`
    }
}