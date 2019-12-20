/***********************
 * @desc 异常处理
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/
export class RuntimeException {
    private readonly _message: string;
    constructor(message: string) {
        this._message = message
    }

    get name() {
        return "RuntimeException"
    }

    get message() {
        return this._message
    }

    toString() {
        return this.name + ': ' + this.message

    }
}

export class IllegalStateException extends RuntimeException {
    constructor(message: string) {
        super(message)
    }

    get name() {
        return 'IllegalStateException'
    }
}

export class InvalidArgumentException extends RuntimeException {
    constructor(message: string) {
        super(message);
    }

    get name() {
        return 'InvalidArgumentException'
    }
}

export class NotImplementedException extends RuntimeException {
    constructor(message: string='Unimplemented abstract function') {
        super(message);
    }

    get name() {
        return 'NotImplementedException'
    }
}
