module.exports = function({types}) {
    return {
        visitor: {
            /**
             * 
             * @param {*} path 是表示节点之间连接的对象
             * @param {*} state 状态，可以获取path、ast、metadata、code、opts、scope
             */
            StringLiteral(path, state) {
                if(path.node.value === 'XXX') {
                    path.replaceWith(types.stringLiteral(state.opts.name));
                }
            }
        }
    }
}