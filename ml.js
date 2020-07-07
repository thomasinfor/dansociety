function l(p1x,p1y,p2x,p2y){
    var len = Math.sqrt((p1x-p2x)**2+(p1y-p2y)**2);
    return len;
}
 
function convert_1darr(a){
    var arrx = new Array();
    var arry = new Array();
    for(var i=0;i<a.persons[0].pose2d.joints.length/2;i++){
        if(i==17||i==18||i==19||i==20||i==23||i==24) continue;
        arrx.push(a.persons[0].pose2d.joints[i*2]);
        arry.push(a.persons[0].pose2d.joints[i*2+1]);
    }
    return [arrx,arry];
}
 
function convert_2darr(a){
    var arrayx = new Array(a.length);
    var arrayy = new Array(a.length);
    for(var i=0;i<a.length;i++){
        [arrayx[i],arrayy[i]]=convert_1darr(a[i]);
        // arrayx[i]=new Array();
        // arrayy[i]=new Array();
        // for(var j=0;j<a[0].keypoints.length;j++){
        //     if(j==17||j==18||j==19||j==20) continue;
        //     arrayx[i].push(a[i].keypoints[j].position.x);
        //     arrayy[i].push(a[i].keypoints[j].position.y);
        // }
    }
    return [arrayx,arrayy];
 
}
 
function length(x,y){
    var a1 = [l(x[8],y[8],x[16],y[16]),
    l(x[8],y[8],x[12],y[12]),
    l(x[8],y[8],x[13],y[13]),
    l(x[11],y[11],x[12],y[12]),
    l(x[10],y[10],x[11],y[11]),
    l(x[13],y[13],x[14],y[14]),
    l(x[14],y[14],x[15],y[15]),
    l(x[2],y[2],x[12],y[12]),
    l(x[3],y[3],x[13],y[13]),
    l(x[8],y[8],x[6],y[6]),
    l(x[1],y[1],x[2],y[2]),
    l(x[0],y[0],x[1],y[1]),
    l(x[0],y[0],x[17],y[17]),
    l(x[3],y[3],x[4],y[4]),
    l(x[4],y[4],x[5],y[5]),
    l(x[5],y[5],x[18],y[18])];
    return a1;
}
 
function pro(b1x,b1y,b2x,b2y){
    var prop = new Array();
    var l1=length(b1x,b1y);
    var l2=length(b2x,b2y);
    for (var i=0;i<l1.length;i++)
        prop.push(l1[i]/l2[i]);
    return prop;
}
 
function movepoint(prop,video2x,video2y){
    var x_new = new Array(video2x.length);
    var y_new = new Array(video2x.length);
    for (var i=0;i<video2x.length;i++){

        x_new[i]=(new Array(19));
        y_new[i]=(new Array(19));

        x_new[i][8]=video2x[i][8];
        x_new[i][7]=video2x[i][7];
        x_new[i][16]=x_new[i][8]+prop[0]*(video2x[i][16]-video2x[i][8]);
        x_new[i][12]=x_new[i][8]+prop[1]*(video2x[i][12]-video2x[i][8]);
        x_new[i][13]=x_new[i][8]+prop[2]*(video2x[i][13]-video2x[i][8]);
        x_new[i][11]=x_new[i][12]+prop[3]*(video2x[i][11]-video2x[i][12]);
        x_new[i][10]=x_new[i][11]+prop[4]*(video2x[i][10]-video2x[i][11]);
        x_new[i][14]=x_new[i][13]+prop[5]*(video2x[i][14]-video2x[i][13]);
        x_new[i][15]=x_new[i][14]+prop[6]*(video2x[i][15]-video2x[i][14]);
        x_new[i][2]=x_new[i][12]+prop[7]*(video2x[i][2]-video2x[i][12]);
        x_new[i][3]=x_new[i][13]+prop[8]*(video2x[i][3]-video2x[i][13]);
        x_new[i][6]=x_new[i][8]+prop[9]*(video2x[i][6]-video2x[i][8]);
        x_new[i][1]=x_new[i][2]+prop[10]*(video2x[i][1]-video2x[i][2]);
        x_new[i][0]=x_new[i][1]+prop[11]*(video2x[i][0]-video2x[i][1]);
        x_new[i][17]=x_new[i][0]+prop[12]*(video2x[i][17]-video2x[i][0]);
        x_new[i][4]=x_new[i][3]+prop[13]*(video2x[i][4]-video2x[i][3]);
        x_new[i][5]=x_new[i][4]+prop[14]*(video2x[i][5]-video2x[i][4]);
        x_new[i][18]=x_new[i][5]+prop[15]*(video2x[i][18]-video2x[i][5]);

        y_new[i][8]=video2y[i][8];
        y_new[i][7]=video2y[i][7];
        y_new[i][16]=y_new[i][8]+prop[0]*(video2y[i][16]-video2y[i][8]);
        y_new[i][12]=y_new[i][8]+prop[1]*(video2y[i][12]-video2y[i][8]);
        y_new[i][13]=y_new[i][8]+prop[2]*(video2y[i][13]-video2y[i][8]);
        y_new[i][11]=y_new[i][12]+prop[3]*(video2y[i][11]-video2y[i][12]);
        y_new[i][10]=y_new[i][11]+prop[4]*(video2y[i][10]-video2y[i][11]);
        y_new[i][14]=y_new[i][13]+prop[5]*(video2y[i][14]-video2y[i][13]);
        y_new[i][15]=y_new[i][14]+prop[6]*(video2y[i][15]-video2y[i][14]);
        y_new[i][2]=y_new[i][12]+prop[7]*(video2y[i][2]-video2y[i][12]);
        y_new[i][3]=y_new[i][13]+prop[8]*(video2y[i][3]-video2y[i][13]);
        y_new[i][6]=y_new[i][8]+prop[9]*(video2y[i][6]-video2y[i][8]);
        y_new[i][1]=y_new[i][2]+prop[10]*(video2y[i][1]-video2y[i][2]);
        y_new[i][0]=y_new[i][1]+prop[11]*(video2y[i][0]-video2y[i][1]);
        y_new[i][17]=y_new[i][0]+prop[12]*(video2y[i][17]-video2y[i][0]);
        y_new[i][4]=y_new[i][3]+prop[13]*(video2y[i][4]-video2y[i][3]);
        y_new[i][5]=y_new[i][4]+prop[14]*(video2y[i][5]-video2y[i][4]);
        y_new[i][18]=y_new[i][5]+prop[15]*(video2y[i][18]-video2y[i][5]);
    }
    return [x_new,y_new];
}
 
 
function standardization(array){
    var average = new Array(array.length);
    var sdeviation = new Array(array.length);
    for (var i=0;i<array.length;i++){
        var s = 0;
        for (var j=0;j<array[0].length;j++){
            if(j==9) continue;
            s+=array[i][j];
        }
        average[i] = s/(array[0].length-1);
 
        var sd = 0;
        for (var j=0;j<array[0].length;j++){
            if(j==9) continue;
            sd+=(array[i][j]-average[i])**2;
        }
        sdeviation[i]=Math.sqrt(sd/array[0].length);
    }
 
    var array_standard = new Array(array.length);
    for (var i=0;i<array.length;i++){
        array_standard[i]= new Array(array[0].length);
        for (var j=0;j<array[0].length;j++){
            if(j==9) continue;
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
    var biasx = new Array(a1x.length);
    var biasy = new Array(a1x.length);
    var loss = new Array(a1x.length);
    for(var i=0;i<a1x.length;i++){
        biasx[i]=(a1x[i][0]-a2x[i][0]);
        biasy[i]=(a1y[i][0]-a2y[i][0]);
    }
    for(var i=0;i<a1x.length;i++){
        loss[i] = new Array(a1x[0].length);
        for(var j=0;j<a1x[0].length;j++){
            if(j==9) continue;
            a2x[i][j] += biasx[i];
            a2y[i][j] += biasy[i];
            loss[i][j] = (a1x[i][j]-a2x[i][j])**2+(a1y[i][j]-a2y[i][j])**2;
        }
    }
    return loss;
}
 
 
//input image as a1,a2
exports.evaluate_loss = function(a1,v1,a2,v2){
    var b1x,b1y,b2x,b2y;
    [b1x,b1y] = convert_1darr(a1.frames[0]);
    [b2x,b2y] = convert_1darr(a2.frames[0]);
    // console.log(b1x.length);
    // console.log(b1y.length);
    // console.log(b2x.length);
    // console.log(b2y.length);

    var prop = pro(b1x,b1y,b2x,b2y);
    // console.log(prop);

    //input video as v1,v2
    var v1x,v1y,v2x,v2y;
    [v1x,v1y] = convert_2darr(v1.frames);
    [v2x,v2y] = convert_2darr(v2.frames);
    // console.log(v1x.length);
    // console.log(v1y.length);
    // console.log(v2x.length);
    // console.log(v2y.length);

    [v2x_new,v2y_new] = movepoint(prop,v2x,v2y);
    // console.log(v2x_new[0]);
    // console.log(v2y_new[0]);
    // console.log(v2x_new.length);
    // console.log(v2y_new.length);

    var res_loss = loss(v1x,v1y,v2x_new,v2y_new);
    // console.log(res_loss.length);
    // console.log(res_loss[0]);
    var tot=0;
    for(var i=0;i<res_loss.length;i++){
        for(var j=0;j<res_loss[0].length;j++){
            if(j==9) continue;
            tot+=res_loss[i][j];
        }
    }
    return tot;
}