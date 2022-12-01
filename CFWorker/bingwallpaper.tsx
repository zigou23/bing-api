addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const req = request
  const urlStr = req.url
  const urlObj = new URL(urlStr)
  const path = urlObj.href.substr(urlObj.origin.length)
  const headers_init = {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  }
  const headers_html = {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  }
  console.log(path)
  try {
    if (path == "/favicon.ico") {
      return fetch("https://cdn.jsdelivr.net/npm/zg-cdn/logo/64.png")
    }
    const hostdomain = request.headers.get("host");
    const ua = request.headers.get("user-agent");
    if (path == "/" || !ua.match(/Mozilla\/5.0\b/i) ) {
      return new Response('<p style="font-family:Sans-serif">/img /jsonall /json ?day=[0-14]&random=1&server=1&mkt=<a href="https://github.com/zigou23/bing-wallpaper/blob/main/bing-get.md">en-US</a>&hd=1&s=1920x1080</p>', headers_html); //暂时不开放
    }

    //bing壁纸
    const Day = urlObj.searchParams.get('day'); //获取天数 没有数值则为0
    const Random = urlObj.searchParams.get('random'); //随机输出
    const Server = urlObj.searchParams.get('server'); //服务器输出
    // "zh-CN","ja-JP","it-IT","fr-FR","en-US","en-IN","en-GB","en-CA","de-DE"等
    const BingImglanguage = urlObj.searchParams.get('mkt') || ''; //语言输出
    const hd = urlObj.searchParams.get('hd');
    //1920x1080 
    const s = urlObj.searchParams.get('s') || ''; //长宽比例输出
    //url link all day 15
    const Url1 = "https://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt="+BingImglanguage;
    const Url2 = "https://global.bing.com/HPImageArchive.aspx?format=js&idx=7&n=8&mkt="+BingImglanguage;

    let array = new Array(); //创建数组，这样可以指定图片[0-15]这样子

    for(let v1=0; v1<=7; v1++){ //获取json的所有数值并组装
      array[v1] = (await (await fetch(Url1)).json()).images[v1];
      array[v1].url="https://bing.com"+array[v1].url;
      if(v1==7){ //1-8天执行完成后执行9-15天的值，即1-6
        for(let v2=1; v2<=7; v2++){
          array[v2+7] = (await (await fetch(Url2)).json()).images[v2];
          array[v2+7].url="https://bing.com"+array[v2+7].url;
        }
      }
    }
    const arrayjson = JSON.stringify(array); //array转为json共0-14个值
    if(path.startsWith('/jsonall')){
      return new Response(arrayjson);
    }
    let rs = '';//结果
    if(Random){ //随即输出
      rs = array[randomNum(0,14)]
    }else if(Day){  //Day值输出
      rs = array[Day]
    }else{
      rs = array[0]
    }
    
    if(s){
      rs.url = 'https://bing.com'+rs.urlbase+'_'+s+'.jpg'
    }else if(hd){
      rs.url = 'https://bing.com'+rs.urlbase+'_UHD.jpg'
    }
    if(Server){
      return fetch(rs.url) //走deno server
    }
    if(path.startsWith('/img')){
      return Response.redirect(rs.url, 301);
    }

  return new Response(JSON.stringify(rs)); //
  }catch(err) {
    console.log(err)
    return new Response(JSON.stringify({'status':500,'msg':'Request timed out'}), {
      status: 500,
      headers: {
        "content-type": "application/javascript; charset=utf-8",  //默认UTF-8格式
        "Access-Control-Allow-Origin": "*",
      }
    })
  }
}
//随机数
function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
        break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        break;
            default:
                return 0;
            break;
    }
}
