export const getLocalStorageObject = (key: string) => {
  // @ts-ignore
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null
}

export const getLocalStorage = (key: string) => {
  return localStorage.getItem(key) ? localStorage.getItem(key) : null
}

export const setLocalStorageObject = (key: string, object: any) => {
  return localStorage.setItem(key, JSON.stringify(object))
}

export const setLocalStorage = (key: string, data: any) => {
  return localStorage.setItem(key, data)
}

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key)
}
