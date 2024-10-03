import {config} from "dotenv";
import {Sequelize} from "sequelize";

config({
    path: "../.env"
})
const initDB = () => {
    const sequelize = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@database:5432/${process.env.POSTGRES_DB}`)

    sequelize
        .authenticate()
        .then(value => () => {
            console.log("Connected to db")
        })
        .catch(reason => {
            console.log("Cannot connect to DB")
            console.log(reason)
            process.exit(1)
        })

    return sequelize
}

export const sequelizeInstance = initDB();


