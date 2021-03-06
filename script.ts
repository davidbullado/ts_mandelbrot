class Color {

    constructor(public r: number, public g: number, public b: number) { }

    static scale(k: number, v: Color) {
        return new Color(k * v.r, k * v.g, k * v.b);
    }

    static plus(v1: Color, v2: Color) {
        return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
    }

    static times(v1: Color, v2: Color) {
        return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b);
    }

    static white = new Color(1.0, 1.0, 1.0);
    static grey = new Color(0.5, 0.5, 0.5);
    static black = new Color(0.0, 0.0, 0.0);
    static background = Color.black;
    static defaultColor = Color.black;

    static toDrawingColor(c: Color) {
        var legalize = d => d > 1 ? 1 : d;
        return {
            r: Math.ceil(legalize(c.r) * 255),
            g: Math.ceil(legalize(c.g) * 255),
            b: Math.ceil(legalize(c.b) * 255)
        }
    }

}

class Mandelbrot {
  static getDepth(cx:number, cy:number, maxIter:number){
    var x = 0.0;
    var y = 0.0;
    var xx = 0;
    var yy = 0;
    var xy = 0;

    var i = maxIter;
    while (xx + yy <= 4 && i > 0) {
      xy = x * y;
      xx = x * x;
      yy = y * y;
      x = xx - yy + cx;
      y = xy + xy + cy;
      --i ;
    }


    var iter ;
    if (xx + yy <= 4){
      iter = 0 ;
    } else if (i > 0){
        iter = maxIter - i;
        var log_zn = Math.log(xx+yy)/2.0 ;
        var nu = Math.log(log_zn/Math.log(2.0)) / Math.log(2.0) ;
        iter = iter+1-nu ;

    } else {
        iter = maxIter - i;
    }
    return iter;
  }
}

class Colorizer{
  nbColor:number ;
  panel:number[] = Array() ;

  constructor (nbColor:number, nbSinus:number) {
    this.nbColor = nbColor ;
    var step:number = Math.PI*2*nbSinus/nbColor;
    var c:number = 0 ;
    for (var i = 0 ; i < nbColor ; i++) {
      this.panel[i]=(Math.cos(Math.PI+c)+1)/2;
      c+=step;
    }
  }

  getColor(ind:number){
    var indfloor = Math.floor(ind) ;
    var step = ind-indfloor ;

    var color1 = this.panel[indfloor] ;
    var color2 = this.panel[indfloor+1] ;

    return color1 + (color2-color1) * step;
  }

}

class Fractalizer {

    convol:Array<number> = [1,2,1, 2,4,2, 1,2,1];

    render(ctx, screenWidth, screenHeight) {
      var factor : number = 3 ;
      var factor2 : number = factor*factor;

      var stepx:number = 3.0/(screenWidth*factor) ;
      var stepy:number = -2.0/(screenHeight*factor) ;

      var rx:number = -2.25;
      var cx:number = rx;
      var cy:number = 1.0;

      var colorR:Colorizer = new Colorizer(200,1) ;
      var colorG:Colorizer = new Colorizer(200,1) ;
      var colorB:Colorizer = new Colorizer(200,2) ;



      var layout:Array<number> = new Array(screenHeight*factor*screenWidth*factor);

      var stop:boolean = true;
        for (var y = 0; y < screenHeight*factor; y++) {
            for (var x = 0; x < screenWidth*factor; x++) {
                var result : number = Mandelbrot.getDepth(cx,cy,201);
                layout[y*screenWidth*factor+x] = result ;
                cx += stepx;
            }
            cy += stepy;
            cx = rx;
        }

        for (var y = 0; y < screenHeight; y++) {
            for (var x = 0; x < screenWidth; x++) {

              var mat:number[] = new Array(factor2) ;
              var x0 : number = y*screenWidth*factor2+x*factor ;

              for (var j = 0 ; j < factor ; j++){
                var jfact = j*factor;
                var cj = x0 +jfact*screenWidth ;
                for (var i = 0 ; i < factor ; i++){
                  mat[jfact+i] = cj + i
                }
              }

                for (var s=0 ; s < mat.length ; s++){
                  result += layout[mat[s]]*this.convol[s] ;
                }

                result /= 16.0 ;

                  var color = new Color(
                    colorR.getColor(result),
                    colorG.getColor(result),
                    colorB.getColor(result)
                  );

                var c = Color.toDrawingColor(color);

                ctx.fillStyle = "rgb(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ")";
                ctx.fillRect(x, y, x + 1, y + 1);
            }
        }

        layout = null ;
    }

}

function exec() {4
    var canv = document.createElement("canvas");
    canv.width = 800;
    canv.height = canv.width*2/3 ;
    canv.style.position = "absolute";
    canv.style.margin = "auto";
    canv.style.top = "0";
    canv.style.left = "0";
    canv.style.right = "0";
    canv.style.bottom = "0";
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");
    var rayTracer = new Fractalizer();
    return rayTracer.render(ctx, canv.width, canv.height);
}

exec();
