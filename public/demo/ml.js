function l(p1x,p1y,p2x,p2y){
    var len = Math.sqrt((p1x-p2x)**2+(p1y-p2y)**2);
    return len;
}
 
function convert_1darr(a){
    var arrx = Array(a.length);
    var arry = Array(a.length);
    for(var i=0;i<a.length;i++){
        arrx[i]=(a.keypoints[i].position.x);
        arry[i]=(a.keypoints[i].position.y);
    }
    return [arrx,arry];
}
 
function convert_2darr(a){
    var arrayx = Array(a.length);
    var arrayy = Array(a.length);
    for(var i=0;i<a.length;i++){
        arrayx[i]=Array();
        arrayy[i]=Array();
        for(var j=0;j<a[0].keypoints.length;j++){
            if(j==1||j==2||j==3||j==4) continue;
            arrayx[i].push(a[i].keypoints[j].position.x);
            arrayy[i].push(a[i].keypoints[j].position.y);
        }
        // arrayx[i]=arrayx[i].splice(1,4);
        // arrayy[i]=arrayy[i].splice(1,4);
    }
    return [arrayx,arrayy];
 
}
 
function length(x,y){
    var a1 = [l(x[0],y[0],x[1],y[1]),
    l(x[0],y[0],x[2],y[2]),
    l(x[1],y[1],x[3],y[3]),
    l(x[2],y[2],x[4],y[4]),
    l(x[3],y[3],x[5],y[5]),
    l(x[4],y[4],x[6],y[6]),
    l(x[1],y[1],x[7],y[7]),
    l(x[2],y[2],x[8],y[8]),
    l(x[7],y[7],x[9],y[9]),
    l(x[8],y[8],x[10],y[10]),
    l(x[9],y[9],x[11],y[11]),
    l(x[10],y[10],x[12],y[12])];
    return a1;
}
 
function pro(b1x,b1y,b2x,b2y){
    var prop = Array(b1x.length);
    var l1=length(b1x,b1y);
    var l2=length(b2x,b2y);
    for (var i=0;i<b1x.length;i++){
        prop[i]=l1[i]/l2[i];
    }
    return prop;
}
 
function movepoint(prop,video2x,video2y) {
    var x_new = Array(video2x.length);
    var y_new = Array(video2x.length);
    for (var i=0;i<video2x.length;i++){
        x_new[i]=(Array(12));
        y_new[i]=(Array(12));
        x_new[i][0]=video2x[i][0];
        x_new[i][1]=x_new[i][0]+prop[0]*(video2x[i][1]-video2x[i][0]);
        x_new[i][2]=x_new[i][0]+prop[1]*(video2x[i][2]-video2x[i][0]);
        x_new[i][3]=x_new[i][1]+prop[2]*(video2x[i][3]-video2x[i][1]);
        x_new[i][4]=x_new[i][2]+prop[3]*(video2x[i][4]-video2x[i][2]);
        x_new[i][5]=x_new[i][3]+prop[4]*(video2x[i][5]-video2x[i][3]);
        x_new[i][6]=x_new[i][4]+prop[5]*(video2x[i][6]-video2x[i][4]);
        x_new[i][7]=x_new[i][1]+prop[6]*(video2x[i][7]-video2x[i][1]);
        x_new[i][8]=x_new[i][2]+prop[7]*(video2x[i][8]-video2x[i][2]);
        x_new[i][9]=x_new[i][7]+prop[8]*(video2x[i][9]-video2x[i][7]);
        x_new[i][10]=x_new[i][8]+prop[9]*(video2x[i][10]-video2x[i][8]);
        x_new[i][11]=x_new[i][9]+prop[10]*(video2x[i][11]-video2x[i][9]);
        x_new[i][12]=x_new[i][10]+prop[11]*(video2x[i][12]-video2x[i][10]);
        y_new[i][0]=video2y[i][0];
        y_new[i][1]=y_new[i][0]+prop[0]*(video2y[i][1]-video2y[i][0]);
        y_new[i][2]=y_new[i][0]+prop[1]*(video2y[i][2]-video2y[i][0]);
        y_new[i][3]=y_new[i][1]+prop[2]*(video2y[i][3]-video2y[i][1]);
        y_new[i][4]=y_new[i][2]+prop[3]*(video2y[i][4]-video2y[i][2]);
        y_new[i][5]=y_new[i][3]+prop[4]*(video2y[i][5]-video2y[i][3]);
        y_new[i][6]=y_new[i][4]+prop[5]*(video2y[i][6]-video2y[i][4]);
        y_new[i][7]=y_new[i][1]+prop[6]*(video2y[i][7]-video2y[i][1]);
        y_new[i][8]=y_new[i][2]+prop[7]*(video2y[i][8]-video2y[i][2]);
        y_new[i][9]=y_new[i][7]+prop[8]*(video2y[i][9]-video2y[i][7]);
        y_new[i][10]=y_new[i][8]+prop[9]*(video2y[i][10]-video2y[i][8]);
        y_new[i][11]=y_new[i][9]+prop[10]*(video2y[i][11]-video2y[i][9]);
        y_new[i][12]=y_new[i][10]+prop[11]*(video2y[i][12]-video2y[i][10]);
 
    }
    return [x_new,y_new];
}
 
 
function standardization(array){
    var average = Array(array.length);
    var sdeviation = Array(array.length);
    for (var i=0;i<array.length;i++){
        var s = 0;
        for (var j=0;j<array[0].length;j++){
            s+=array[i][j];
        }
        average[i] = s/array[0].length;
 
        var sd = 0;
        for (var j=0;j<array[0].length;j++){
            sd+=(array[i][j]-average[i])**2;
        }
        sdeviation[i]=Math.sqrt(sd/array[0].length);
    }
 
    var array_standard = Array(array.length);
    for (var i=0;i<array.length;i++){
        array_standard[i]=Array(array[0].length);
        for (var j=0;j<array[0].length;j++){
            array_standard[i][j]=(array[i][j]-average[i])/sdeviation[i];
        }
    }
    return array_standard;
}
 
function loss(array1x, array1y, array2x, array2y){
    var a1x = standardization(array1x);
    var a1y = standardization(array1y);
    var a2x = standardization(array2x);
    var a2y = standardization(array2y);
    var biasx = Array(a1x.length);
    var biasy = Array(a1x.length);
    var loss = Array(a1x.length);
    for(var i=0;i<a1x.length;i++){
        biasx[i]=(a1x[i][0]-a2x[i][0]);
        biasy[i]=(a1y[i][0]-a2y[i][0]);
    }
    for(var i=0;i<a1x.length;i++){
        loss[i]=Array(a1x[0].length);
        for(var j=0;j<a1x[0].length;j++){
            a2x[i][j] += biasx[i];
            a2y[i][j] += biasy[i];
            loss[i][j] = (a1x[i][j]-a2x[i][j])**2+(a1y[i][j]-a2y[i][j])**2;
        }
    }
    return loss;
}


//input image as a1,a2
function evaluate_loss(a1,a2,v1,v2){
    var b1x = convert_1darr(a1)[0];
    var b1y = convert_1darr(a1)[1];
    var b2x = convert_1darr(a2)[0];
    var b2y = convert_1darr(a2)[1];

    var prop = pro(b1x,b1y,b2x,b2y);

    //input video as v1,v2
    var v1x = convert_2darr(v1)[0];
    var v1y = convert_2darr(v1)[1];
    var v2x = convert_2darr(v2)[0];
    var v2x = convert_2darr(v2)[1];
     
    var v2x_new = movepoint(prop,v2x,v2y)[0];
    var v2y_new = movepoint(prop,v2x,v2y)[1];
     
    var res_loss = loss(v1x,v1y,v2x_new,v2y_new);
    return res_loss;
}
    