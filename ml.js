const MIN=(a,b)=>a<b?a:b;
const MAX=(a,b)=>a>b?a:b;
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
            arrx.push(100*origin.pose2d.joints[i*2]/origin.pose2d.bbox.width);
            arry.push(100*origin.pose2d.joints[i*2+1]/origin.pose2d.bbox.height);
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



function pose(a1,v1,a2,v2){
    // input image as a1,a2
    if(a2.frames[0].persons.length==0) return {error: "Detect no person in the picture."};
    if(a1.frames[0].persons.length==0) return {error: "Detect no person in the picture."};
    var [b1x,b1y] = convert_1darr(a1.frames[0]);
    var [b2x,b2y] = convert_1darr(a2.frames[0]);

    var prop = pro(b1x,b1y,b2x,b2y);
    if(!prop) return {error: "Can't find the whole body."};

    // input video as v1,v2
    var [v1x,v1y] = convert_2darr(v1.frames);
    var [v2x,v2y] = convert_2darr(v2.frames);

    var [v1x_new,v1y_new] = movepoint(v1x,v1y);
    var [v2x_new,v2y_new] = movepoint(v2x,v2y,prop);

    var move=recalibrate({standard: [v1x_new,v1y_new],personal: [v2x_new,v2y_new]});
    if(move>0){
        v1x_new=Array(move).fill(empty).concat(v1x_new);
        v1y_new=Array(move).fill(empty).concat(v1y_new);
    }else if(move<0){
        v1x_new=v1x_new.slice(-move);
        v1y_new=v1y_new.slice(-move);
    }
    if(v1x_new.length>v2x_new.length){
        v1x_new=v1x_new.slice(0,v2x_new.length);
        v1y_new=v1y_new.slice(0,v2y_new.length);
    }
    return {standard: [v1x_new,v1y_new],personal: [v2x_new,v2y_new]};
}
function delta4(array1x,array1y,array2x,array2y){
    var loss=new Array(MIN(array1x.length,array2x.length));
    for(var i=0;i<loss.length;i++){
        loss[i]=new Array(joints);
        for(var j=0;j<joints;j++){
            loss[i][j]=[(array1x[i][j]-array2x[i][j]),(array1y[i][j]-array2y[i][j])];
        }
    }
    return loss;
}
function delta1(points){return delta4(points.standard[0],points.standard[1],points.personal[0],points.personal[1]);}
function total_loss(loss){
    var tot=0,cnt=0;
    for(var i=0;i<loss.length;i++){
        for(var j=0;j<loss[0].length;j++){
            if(j!=7&&!isNaN(loss[i][j][0])) tot+=loss[i][j][0]**2+loss[i][j][1]**2,cnt++;
        }
    }
    return tot/cnt;
}
function recalibrate(points){
    var min=[0,total_loss(delta1(points))],range=100,x;
    var rec=new Array(range*2+1);
    rec[30]=min[1];
    for(var i=1;i<=range;i++){
        x=total_loss(delta4(points.standard[0].slice(i),points.standard[1].slice(i),points.personal[0],points.personal[1]));
        if(x<min[1]) min=[-i,x];
        rec[30-i]=x;
        x=total_loss(delta4(points.standard[0],points.standard[1],points.personal[0].slice(i),points.personal[1].slice(i)));
        if(x<min[1]) min=[i,x];
        rec[30+i]=x;
    }
    return min[0];
}
async function evaluate(a1,v1,a2,v2){
    var point=await pose(a1,v1,a2,v2);
    return point;
}

exports.delta1=delta1;
exports.delta4=delta4;
exports.total_loss=total_loss;
exports.pose=pose;
exports.evaluate=evaluate;