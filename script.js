var fonts = document.createElement('link');
fonts.setAttribute('rel', 'preconnect');
fonts.setAttribute('href', 'https://fonts.googleapis.com');
document.head.appendChild(fonts);

var fonts2 = document.createElement('link');
fonts2.setAttribute('rel', 'preconnect');
fonts2.setAttribute('href', 'https://fonts.gstatic.com');
fonts2.setAttribute('crossorigin', 'true');
document.head.appendChild(fonts2);

var fonts3 = document.createElement('link');
fonts3.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Poppins&display=swap');
fonts3.setAttribute('rel', 'stylesheet');
document.head.appendChild(fonts3);

var htmx = document.createElement('script');  
htmx.setAttribute('src','https://unpkg.com/htmx.org@1.9.6');
htmx.setAttribute('integrity',"sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni");
htmx.setAttribute('crossorigin',"anonymous");
document.head.appendChild(htmx);

function goto(rel) {
    let url = window.location.href;
    let urlArr = url.split('/');
    let newUrl = urlArr[0] + '//' + urlArr[2] + rel;
    window.location.href = newUrl;
}

function getURLParam(param) {
    let url = document.location.search;
    let params = URLSearchParams(url);
    return params.get(param);
}
