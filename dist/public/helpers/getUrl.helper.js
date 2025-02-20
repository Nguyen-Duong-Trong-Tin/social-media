const getUrlHelper = () => {
  return {
    base: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
    search: window.location.search
  }
}

export default getUrlHelper;