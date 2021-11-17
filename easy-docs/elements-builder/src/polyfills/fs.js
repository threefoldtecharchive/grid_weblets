if (!localStorage) {
    throw Error('local storage is not defined')
}


class FileNotFoundError extends Error {
}


export function readFileSync(path) {
    let content = localStorage.getItem(path)
    if (content === null) {
        throw new FileNotFoundError(`file cannot be found: ${path}`)
    }
    return content
}

export function writeFileSync(path, content) {
    localStorage.setItem(path, content)
}

export function existsSync(path){
    let content = localStorage.getItem(path)
    return content !== null
}

export function mkdirSync(path){

}