

function nameValidator () {
    return function name (value) {
      return (value && !!value.match(/^[0-9a-zA-Z]+$/)) || 'Only alphanumeric characters are allowed'
    }
}

function requiredValidator () {
  return function required (value) {
    return (value !== undefined && value !== null && value !== '') || 'This field is required'
  }
}


export { nameValidator, requiredValidator};


