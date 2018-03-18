/**
 * 王飞
 * 画温度云图CAD图纸传感器贴图 
 * 
 */
var canvas = document.getElementById("adminCanvas");
var base64List = [];
if(canvas.getContext){ 
    var ctx = canvas.getContext("2d"); 
    it.util.adminApi('collector','getCount',{}, function(datas){
              if(datas.length > 0){
                  datas.forEach(function(data){
                      var category = [];
                      it.util.adminApi('collector','getPosition',{parentid:data.parentId}, function(results){
                      if(results.length > 0){
                        results.forEach(function(result){
                                ctx.font = "120px Courier New";
                                ctx.fillStyle="#03B09A";
                                ctx.fillRect(0,0,canvas.width,canvas.height);
                                ctx.fillStyle="#ffffff";
                                ctx.fillText(result.id, 30, 200);
                                var base64 = canvas.toDataURL('image/jpeg');
                                ctx.clearRect(0,0,canvas.width,canvas.height);
                                var HeatMap = {
                                    base64:base64,
                                    position:result.position
                                }
                                category.push(HeatMap);
                         });
                         var parentId = {
                             parentId:data.parentId,
                             category:category
                         }
                         base64List.push(parentId);
                      }
                    },null,'application/json; charset=UTF-8'); 
                  });  
              }
           },null,'application/json; charset=UTF-8');  
                
}  

