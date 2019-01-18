const test1 = function (content:string) {
    const element = document.createElement('h1')
    element.innerHTML =content
    element.id='h1'
    console.log(content)
    return element
}

document.body.appendChild(test1('hello typescript world'))