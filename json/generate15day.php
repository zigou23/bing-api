<?php
//这是用于生成json文件
//语言
$language = array("zh-CN","ja-JP","it-IT","fr-FR","en-US","en-IN","en-GB","en-CA","de-DE");

for ($i=0 ; $i<=8 ; $i++){
    //每天获取15天的数据，生成15day-zh-CN.json
    $filename = '15day-'.$language[$i].'.json';
    //网络中获取json
    $bingjson1 = file_get_contents('https://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt='.$language[$i]);
    $bingjson1 = json_decode($bingjson1,true);
    $bingjson2 = file_get_contents('https://global.bing.com/HPImageArchive.aspx?format=js&idx=7&n=8&mkt='.$language[$i]);
    $bingjson2 = json_decode($bingjson2,true);
    //获取当天的值
    $filejson = '['; //创建数组，这样可以指定图片[0-15]这样子
    for ($v=0; $v<=7; $v++){ //获取json的所有数值并组装
        $json =  $bingjson1['images'][$v];
        $filejson .= json_encode($json,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE).",\r\n";
        if ($v==7){ //1-8天执行完成后执行9-15天的值，即1-6
            for ($v1=1; $v1<=6; $v1++){
                $json =  $bingjson2['images'][$v1];
                $filejson .= json_encode($json,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE).",\r\n";
                if ($v1==6){ //最后数组收尾
                    $json =  $bingjson2['images'][7];
                    $filejson .= json_encode($json,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
                }
            }
        }
        $filejson .= ']'; //结束数组
        file_put_contents($filename, $filejson);
    }
}
echo 'ok';
?>
