import {DataTypes} from "sequelize";
import {sequelizeInstance} from "../db/Database";

// export default class DummyModel extends Model {}
//
// DummyModel.init(
//     {
//         // Model attributes are defined here
//         key: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             primaryKey: true
//         },
//         value: {
//             type: DataTypes.STRING,
//         },
//     },
//     {
//         sequelize: sequelizeInstance,
//         modelName: 'Dummy',
//     },
// );

const DummyModel = sequelizeInstance.define(
    'Dummy',
    {
        // Model attributes are defined here
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        value: {
            type: DataTypes.STRING,
        },
    },
    {
        // Other model options go here
    },
);

export default DummyModel

