var Color = (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.scale = function (k, v) {
        return new Color(k * v.r, k * v.g, k * v.b);
    };
    Color.plus = function (v1, v2) {
        return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
    };
    Color.times = function (v1, v2) {
        return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b);
    };
    Color.toDrawingColor = function (c) {
        var legalize = function (d) { return d > 1 ? 1 : d; };
        return {
            r: Math.ceil(legalize(c.r) * 255),
            g: Math.ceil(legalize(c.g) * 255),
            b: Math.ceil(legalize(c.b) * 255)
        };
    };
    Color.white = new Color(1.0, 1.0, 1.0);
    Color.grey = new Color(0.5, 0.5, 0.5);
    Color.black = new Color(0.0, 0.0, 0.0);
    Color.background = Color.black;
    Color.defaultColor = Color.black;
    return Color;
})();
var Mandelbrot = (function () {
    function Mandelbrot() {
    }
    Mandelbrot.getDepth = function (cx, cy, maxIter) {
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
            --i;
        }
        var iter;
        if (xx + yy <= 4) {
            iter = 0;
        }
        else if (i > 0) {
            iter = maxIter - i;
            var log_zn = Math.log(xx + yy) / 2.0;
            var nu = Math.log(log_zn / Math.log(2.0)) / Math.log(2.0);
            iter = iter + 1 - nu;
        }
        else {
            iter = maxIter - i;
        }
        return iter;
    };
    return Mandelbrot;
})();
var Colorizer = (function () {
    function Colorizer(nbColor, nbSinus) {
        this.panel = Array();
        this.nbColor = nbColor;
        var step = Math.PI * 2 * nbSinus / nbColor;
        var c = 0;
        for (var i = 0; i < nbColor; i++) {
            this.panel[i] = (Math.cos(Math.PI + c) + 1) / 2;
            c += step;
        }
    }
    Colorizer.prototype.getColor = function (ind) {
        var indfloor = Math.floor(ind);
        var step = ind - indfloor;
        var color1 = this.panel[indfloor];
        var color2 = this.panel[indfloor + 1];
        return color1 + (color2 - color1) * step;
    };
    return Colorizer;
})();
var Fractalizer = (function () {
    function Fractalizer() {
    }
    Fractalizer.prototype.render = function (ctx, screenWidth, screenHeight) {
        var factor = 3;
        var factor2 = factor * factor;
        var stepx = 3.0 / (screenWidth * factor);
        var stepy = -2.0 / (screenHeight * factor);
        var cx = -2.5;
        var cy = 1.0;
        var colorR = new Colorizer(200, 1);
        var colorG = new Colorizer(200, 1);
        var colorB = new Colorizer(200, 4);
        var layout = new Array(screenHeight * factor * screenWidth * factor);
        var stop = true;
        for (var y = 0; y < screenHeight * factor; y++) {
            for (var x = 0; x < screenWidth * factor; x++) {
                var result = Mandelbrot.getDepth(cx, cy, 201);
                layout[y * screenWidth * factor + x] = result;
                cx += stepx;
            }
            cy += stepy;
            cx = -2.5;
        }
        for (var y = 0; y < screenHeight; y++) {
            for (var x = 0; x < screenWidth; x++) {
                var mat = new Array(factor2);
                var x0 = y * screenWidth * factor2 + x * factor;
                for (var j = 0; j < factor; j++) {
                    var jfact = j * factor;
                    var cj = x0 + jfact * screenWidth;
                    for (var i = 0; i < factor; i++) {
                        mat[jfact + i] = cj + i;
                    }
                }
                for (var s = 0; s < mat.length; s++) {
                    result += layout[mat[s]];
                }
                result /= mat.length;
                var color = new Color(colorR.getColor(result), colorG.getColor(result), colorB.getColor(result));
                var c = Color.toDrawingColor(color);
                ctx.fillStyle = "rgb(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ")";
                ctx.fillRect(x, y, x + 1, y + 1);
            }
        }
        layout = null;
    };
    return Fractalizer;
})();
function exec() {
    4;
    var canv = document.createElement("canvas");
    canv.width = 800;
    canv.height = canv.width * 2 / 3;
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");
    var rayTracer = new Fractalizer();
    return rayTracer.render(ctx, canv.width, canv.height);
}
exec();
