function goto(rel) {
    let url = window.location.href;
    let urlArr = url.split('/');
    let newUrl = urlArr[0] + '//' + urlArr[2] + rel;
    window.location.href = newUrl;
}

function getURLParam(param) {
    let url = document.location.search;
    let params = new URLSearchParams(url);
    return params.get(param);
}
