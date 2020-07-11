const joints=17;
function largest_person(x){
    if(x.length==0) return null;
    var max=0;
    for(var i=1;i<x.length;i++)
        if(x[i].pose2d.is_main&&x[max].pose2d.bbox.height*x[max].pose2d.bbox.width<x[i].pose2d.bbox.height*x[i].pose2d.bbox.width)
            max=i;
    return x[max];
}

function l(p1x,p1y,p2x,p2y){return Math.sqrt((p1x-p2x)**2+(p1y-p2y)**2);}

const exclude=[8,9,17,18,19,20,23,24];
const empty=[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN];
function convert_1darr(a){
    var arrx = [], arry = [], origin = largest_person(a.persons);
    if(!origin) return [empty,empty];
    for(var i=0;i<a.persons[0].pose2d.joints.length/2;i++){
        if(exclude.includes(i)) continue;
        if(origin.pose2d.joints[i*2]<0||origin.pose2d.joints[i*2+1]<0){
            arrx.push(NaN); arry.push(NaN);
        }else{
            arrx.push(a.width*origin.pose2d.joints[i*2]); arry.push(a.height*origin.pose2d.joints[i*2+1]);
        }
    }
    return [arrx,arry];
}

function convert_2darr(a){
    var arrayx = new Array(a.length), arrayy = new Array(a.length);
    for(var i=0;i<a.length;i++)
        [arrayx[i],arrayy[i]]=convert_1darr(a[i]);
    return [arrayx,arrayy];
}

const graph=[
    [7,14],[7,10],[7,11],[10,9],[9,8],[11,12],[12,13],[10,2],[11,3],[7,6],[2,1],[1,0],[0,15],[3,4],[4,5],[5,16]
];
function length(x,y){
    return graph.map(e=>l(x[e[0]],y[e[0]],x[e[1]],y[e[1]]));
}

function check(arr){
    for(var i=0;i<arr.length;i++) if(i!=9&&arr[i]==NaN) return false;
    return true;
}

function pro(b1x,b1y,b2x,b2y){
    if(check(b1x,b1y)&&check(b2x,b2y)){
        var prop = [], l1=length(b1x,b1y), l2=length(b2x,b2y);
        for (var i=0;i<l1.length;i++) prop.push(l1[i]/l2[i]);
        return prop;
    }else return null;
}

const identity=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
function movepoint(video2x,video2y,prop=null){
    if(!prop) prop=identity;
    var x_new = new Array(video2x.length), y_new = new Array(video2x.length);
    for (var i=0;i<video2x.length;i++){
        x_new[i]=(new Array(19)); y_new[i]=(new Array(19)); x_new[i][7]=y_new[i][7]=0;
        for(var j=0;j<graph.length;j++){
            x_new[i][graph[j][1]]=x_new[i][graph[j][0]]+prop[j]*(video2x[i][graph[j][1]]-video2x[i][graph[j][0]]);
            y_new[i][graph[j][1]]=y_new[i][graph[j][0]]+prop[j]*(video2y[i][graph[j][1]]-video2y[i][graph[j][0]]);
        }
    }
    return [x_new,y_new];
}

function standardization(array){
    return array;
    var array_standard = new Array(array.length);
    for (var i=0;i<array.length;i++){
        if(!array[i]){
            array_standard[i]=null;
            continue;
        }
        var average=0;
        for (var j=0;j<array[0].length;j++){
            average+=array[i][j];
        }
        average/=(array[0].length);

        var sd=0;
        for (var j=0;j<array[0].length;j++){
            sd+=(array[i][j]-average)**2;
        }
        sd=Math.sqrt(sd/(array[0].length));

        array_standard[i]=new Array(array[0].length);
        for (var j=0;j<array[0].length;j++){
            array_standard[i][j]=(array[i][j]-average)/sd;
        }
    }
    return array_standard;
}

function loss(array1x,array1y,array2x,array2y){
    // var a1x = standardization(array1x), a1y = standardization(array1y), a2x = standardization(array2x), a2y = standardization(array2y);
    // var biasx = new Array(a1x.length), biasy = new Array(a1x.length), loss = new Array(a1x.length);
    // for(var i=0;i<a1x.length;i++){
    //     if(a1x[i]&&a1y[i]&&a2x[i]&&a2y[i]){
    //         biasx[i]=(a1x[i][0]-a2x[i][0]); biasy[i]=(a1y[i][0]-a2y[i][0]);
    //     }else biasx[i]=biasy[i]=null;
    // }
    // var fail=[];
    // for(var i=0;i<a1x.length;i++){
    //     if(biasx[i]==null){
    //         fail.push(i/a1x.length); loss[i]=null; continue;
    //     }
    //     loss[i] = new Array(a1x[0].length);
    //     for(var j=0;j<a1x[0].length;j++){
    //         a2x[i][j] += biasx[i]; a2y[i][j] += biasy[i];
    //         loss[i][j] = (a1x[i][j]-a2x[i][j])**2+(a1y[i][j]-a2y[i][j])**2;
    //     }
    // }
    // return [loss,fail];
    var loss=new Array(array1x.length);
    for(var i=0;i<loss.length;i++){
        loss[i]=new Array(joints);
        for(var j=0;j<joints;j++){
            loss[i][j]=(array1x[i][j]-array2x[i][j])**2+(array1y[i][j]-array2y[i][j])**2;
        }
    }
    return [loss,null];
}


exports.evaluate_loss = function(a1,v1,a2,v2){
    // input image as a1,a2
    if(a2.frames[0].persons.length==0) return {error: "Detect no person in the picture."};
    if(a1.frames[0].persons.length==0) return {error: "Detect no person in the picture."};
    var [b1x,b1y] = convert_1darr(a1.frames[0]);
    var [b2x,b2y] = convert_1darr(a2.frames[0]);

    var prop = pro(b1x,b1y,b2x,b2y);
    if(!prop) return {error: "Can't find the whole body."};

    // trim frames[] to same size
    if(v1.frames.length>v2.frames.length)
        v1.frames=v1.frames.slice(0,v2.frames.length);
    if(v1.frames.length<v2.frames.length)
        v2.frames=v2.frames.slice(0,v1.frames.length);

    // input video as v1,v2
    var [v1x,v1y] = convert_2darr(v1.frames);
    var [v2x,v2y] = convert_2darr(v2.frames);
    var [v1x_new,v1y_new] = movepoint(v1x,v1y);
    var [v2x_new,v2y_new] = movepoint(v2x,v2y,prop);
    var [res_loss,unprocessable] = loss(v1x_new,v1y_new,v2x_new,v2y_new);

    var tot=0,cnt=0;
    for(var i=0;i<res_loss.length;i++){
        for(var j=0;j<res_loss[0].length;j++){
            if(j!=7&&!isNaN(res_loss[i][j])) tot+=res_loss[i][j],cnt++;
        }
    }
    if(cnt==0) return {error: "Failed to process the video."}
    return {loss: tot/cnt};
}