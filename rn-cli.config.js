/**
 * @file    : rn-cli.config.js
 * @author  : Khiem Ha
 * @date    : 2021-01-26
 * @purpose : Config to project can use TypeScrip
 * @member  : Khiem Ha, Manh Le
*/

module.exports = {
    getTransformModulePath() {
        return require.resolve("react-native-typescript-transformer");
    },
    getSourceExts() {
        return ['ts', 'tsx', 'js', 'jsx'];
    }
};