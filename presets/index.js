

module.exports = function (api) {
    console.log(api)
    const presets = [ 
        ["@babel/preset-env", {
            "corejs": 3,
            "useBuiltIns": "usage"
        }]
     ];
    const plugins = [
        "@babel/transform-runtime"
    ];
    return {
      presets,
      plugins
    };
}