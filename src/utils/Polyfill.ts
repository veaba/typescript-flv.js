/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/
class Polyfill {
    static install() {
        //es6 Object.setPrototypeOf
        Object.setPrototypeOf = Object.setPrototypeOf || function (obj: any, proto: any) {
            obj.__proto__ = proto;
            return obj
        };

        // es6 Object.assign
        Object.assign = Object.assign || function (target: any) {
            if (target === undefined || target === null) {
                throw new TypeError('无法将未定义或空值转换为对象')
            }

            let output = Object(target);
            for (let i = 0; i < arguments.length; i++) {
                let source = arguments[i];
                if (source !== undefined && source !== null) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            output[key] = source[key]
                        }
                    }
                }
            }
            return output
        };

        // ES6 Promise (missing support in IE11)
        const w: any = self;
        if (typeof w.Promise !== "function") {
            require('es6-promise').polyfill();
        }
    }
}

export default Polyfill
