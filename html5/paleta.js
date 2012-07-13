function RGB2HSV(rgb) {
    hsv = new Object();
    max = max3(rgb.r, rgb.g, rgb.b);
    dif = max - min3(rgb.r, rgb.g, rgb.b);
    hsv.saturation = (max == 0.0) ? 0 : (100 * dif / max);
    if (hsv.saturation == 0) hsv.hue = 0;
    else if (rgb.r == max) hsv.hue = 60.0 * (rgb.g - rgb.b) / dif;
    else if (rgb.g == max) hsv.hue = 120.0 + 60.0 * (rgb.b - rgb.r) / dif;
    else if (rgb.b == max) hsv.hue = 240.0 + 60.0 * (rgb.r - rgb.g) / dif;
    if (hsv.hue < 0.0) hsv.hue += 360.0;
    hsv.value = Math.round(max * 100 / 255);
    hsv.hue = Math.round(hsv.hue);
    hsv.saturation = Math.round(hsv.saturation);
    return hsv;
}

// RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
// which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
function HSV2RGB(h) {
    var rgb = new Object();
    var hsv = { hue: h[0], saturation: h[1], value: h[2] };
    if (hsv.saturation == 0) {
        return [Math.round(hsv.value * 2.55), Math.round(hsv.value * 2.55), Math.round(hsv.value * 2.55)];
    } else {
        hsv.hue /= 60;
        hsv.saturation /= 100;
        hsv.value /= 100;
        i = Math.floor(hsv.hue);
        f = hsv.hue - i;
        p = hsv.value * (1 - hsv.saturation);
        q = hsv.value * (1 - hsv.saturation * f);
        t = hsv.value * (1 - hsv.saturation * (1 - f));
        switch (i) {
            case 0: rgb.r = hsv.value; rgb.g = t; rgb.b = p; break;
            case 1: rgb.r = q; rgb.g = hsv.value; rgb.b = p; break;
            case 2: rgb.r = p; rgb.g = hsv.value; rgb.b = t; break;
            case 3: rgb.r = p; rgb.g = q; rgb.b = hsv.value; break;
            case 4: rgb.r = t; rgb.g = p; rgb.b = hsv.value; break;
            default: rgb.r = hsv.value; rgb.g = p; rgb.b = q;
        }
        return [Math.round(rgb.r * 255), Math.round(rgb.g * 255), Math.round(rgb.b * 255)];
    }
}

function getNejblizsi(r, g, b) {
    var min = 999;
    var vyber, dist;
    for (var i = 0; i < seznam_barev.length; i++) {
        dist = Math.abs(seznam_barev[i][0] - r) + Math.abs(seznam_barev[i][1] - g) + Math.abs(seznam_barev[i][2] - b);
        if (dist < min) {
            min = dist;
            vyber = seznam_barev[i];
        }
    }
    return vyber;
}

$.ready(function () {

    /**
    *
    * A method to implement drag and drop. This method is attached to the $ object.
    *
    * @method
    * @param {selector} A valid selector for a slider and its thumb.
    * 
    * ### Slider
    *
    * syntax:
    *
    *  $.slider(selector);
    *
    * arguments:
    *
    * - selector:selector A valid selector to the slider with its thumb.
    * 
    * example:
    *
    *  
    * - $.slider('#volumeSlider');
    *
    */
    $.Drag = {
        // The current element being dragged.
        obj: null,
        // The initalization function for the object to be dragged.
        // elem is an element to use as a handle while dragging (optional).
        // elemParent is the element to be dragged, if not specified, 
        // the handle will be the element dragged.
        // minX, maxX, minY, maxY  are the min and max coordinates 
        // allowed for the element while dragging.
        // bSwapHorzRef will toggle the horizontal coordinate system from referencing
        // the left of the element to the right of the element.
        // bSwapVertRef will toggle the vertical coordinate system from referencing
        // the top of the element to the bottom of the element.
        init: function (elem, elemParent, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef) {
            // Watch for the drag event to start.
            elem.onmousedown = $.Drag.start;
            // Figure out which coordinate system is being used.
            elem.hmode = bSwapHorzRef ? false : true;
            elem.vmode = bSwapVertRef ? false : true;
            // Figure out which element is acting as the draggable "handle."
            elem.root = elemParent && elemParent != null ? elemParent : elem;
            // Initalize the specified coordinate system.
            // In order to keep track of the position of the dragged element,
            // we need to query the inline position values.
            // Therefore we query the element's style properties
            // to get those values and attach them inline on the element.
            if (elem.hmode && isNaN(parseInt(elem.root.style.left))) {
                elem.root.style.left = $.getStyle(elem.root, "left");
            }
            if (elem.vmode && isNaN(parseInt(elem.root.style.top))) {
                elem.root.style.top = $.getStyle(elem.root, "top")
            }
            if (!elem.hmode && isNaN(parseInt(elem.root.style.right))) {
                elem.root.style.right = $.getStyle(elem.root, "right")
            }
            if (!elem.vmode && isNaN(parseInt(elem.root.style.bottom))) {
                elem.root.style.bottom = $.getStyle(elem.root, "bottom")
            }
            // Look to see if the user provided min/max x/y coordinates.
            elem.minX = typeof minX != 'undefined' ? minX : null;
            elem.minY = typeof minY != 'undefined' ? minY : null;
            elem.maxX = typeof maxX != 'undefined' ? maxX : null;
            elem.maxY = typeof maxY != 'undefined' ? maxY : null;
            // Add methods for user-defined functions.
            // The user can attach these to a symbol of the 
            // element being dragged:
            /*
            var targetElem = $.$("#sliderTumb");
            targetElem.onDragEnd = function() {
            alert("You finished dragging!");
            }
            */
            // This will fire when you release the dragged element.
            elem.root.onDragStart = new Function();
            elem.root.onDragEnd = new Function();
            // The following will fire continuously while the element
            // is being dragged. Useful if you want to create a slider that
            // can update some type of data as it is being dragged.
            elem.root.onDrag = new Function();
        },
        start: function (e) {
            // Figure out which object is being dragged.
            var elem = $.Drag.obj = this;
            // Normalize the event object.
            e = $.Drag.fixE(e);
            // Get the current x and y coordinates.
            $.Drag.y = parseInt(elem.vmode ? elem.root.style.top : elem.root.style.bottom);
            $.Drag.x = parseInt(elem.hmode ? elem.root.style.left : elem.root.style.right);
            // Call the user's function with the current x and y coordinates.
            elem.root.onDragStart($.Drag.x, $.Drag.y);
            // Remember the starting mouse position.
            elem.lastMouseX = e.clientX;
            elem.lastMouseY = e.clientY;
            // Do the following if the CSS coordinate system is being used.
            if (elem.hmode) {
                // Set the min and max coordiantes, where applicable.
                if (elem.minX != null) elem.minMouseX = e.clientX - $.Drag.x + elem.minX;
                if (elem.maxX != null) elem.maxMouseX = elem.minMouseX + elem.maxX - elem.minX;
                // Otherwise, use a traditional mathematical coordinate system.
            } else {
                if (elem.minX != null) elem.maxMouseX = -elem.minX + e.clientX + $.Drag.x;
                if (elem.maxX != null) elem.minMouseX = -elem.maxX + e.clientX + $.Drag.x;
            }
            // Do the following if the CSS coordinate system is being used.
            if (elem.vmode) {
                // Set the min and max coordiantes, where applicable.
                if (elem.minY != null) elem.minMouseY = e.clientY - $.Drag.y + elem.minY;
                if (elem.maxY != null) elem.maxMouseY = elem.minMouseY + elem.maxY - elem.minY;
                // Otherwise, we're using a traditional mathematical coordinate system.
            } else {
                if (elem.minY != null) elem.maxMouseY = -elem.minY + e.clientY + $.Drag.y;
                if (elem.maxY != null) elem.minMouseY = -elem.maxY + e.clientY + $.Drag.y;
            }
            // Watch for "drag" and "end" events.
            document.onmousemove = $.Drag.drag;
            document.onmouseup = $.Drag.end;
            return false;
        },
        // A function to watch for all movements of the mouse during the drag event.
        drag: function (e) {
            // Normalize the event object.
            e = $.Drag.fixE(e);
            // Get our reference to the element being dragged.
            var elem = $.Drag.obj;
            // Get the position of the mouse within the window.
            var ey = e.clientY;
            var ex = e.clientX;
            // Get the current x and y coordinates.
            $.Drag.y = parseInt(elem.vmode ? elem.root.style.top : elem.root.style.bottom);
            $.Drag.x = parseInt(elem.hmode ? elem.root.style.left : elem.root.style.right);
            var nx, ny;
            // If a minimum X position was set, make sure it doesn't go past that.
            if (elem.minX != null) ex = elem.hmode ?
				Math.max(ex, elem.minMouseX) : Math.min(ex, elem.maxMouseX);
            // If a maximum X position was set, make sure it doesn't go past that.
            if (elem.maxX != null) ex = elem.hmode ?
				Math.min(ex, elem.maxMouseX) : Math.max(ex, elem.minMouseX);
            // If a minimum Y position was set, make sure it doesn't go past that.
            if (elem.minY != null) ey = elem.vmode ?
				Math.max(ey, elem.minMouseY) : Math.min(ey, elem.maxMouseY);
            // If a maximum Y position was set, make sure it doesn't go past that.
            if (elem.maxY != null) ey = elem.vmode ?
				Math.min(ey, elem.maxMouseY) : Math.max(ey, elem.minMouseY);
            // Figure out the newly translated x and y coordinates.
            nx = $.Drag.x + ((ex - elem.lastMouseX) * (elem.hmode ? 1 : -1));
            ny = $.Drag.y + ((ey - elem.lastMouseY) * (elem.vmode ? 1 : -1));
            // Set the new x and y coordinates onto the element.
            $.Drag.obj.root.style[elem.hmode ? "left" : "right"] = nx + "px";
            $.Drag.obj.root.style[elem.vmode ? "top" : "bottom"] = ny + "px";
            // Remember  the last position of the mouse.
            $.Drag.obj.lastMouseX = ex;
            $.Drag.obj.lastMouseY = ey;
            // Call the user's onDrag function with the current x and y coordinates.
            $.Drag.obj.root.onDrag(nx, ny);
            return false;
        },
        // Function that handles the end of a drag event.
        end: function () {
            // No longer watch for mouse events (as the drag is done).
            document.onmousemove = null;
            document.onmouseup = null;
            // Call our special onDragEnd function with the x and y coordinates
            // of the element at the end of the drag event.
            $.Drag.obj.root.onDragEnd(
				parseInt($.Drag.obj.root.style[$.Drag.obj.hmode ? "left" : "right"]),
				parseInt($.Drag.obj.root.style[$.Drag.obj.vmode ? "top" : "bottom"]));
            // No longer watch the object for drags.
            $.Drag.obj = null;
        },
        // A function for normalizing the event object.
        fixE: function (e) {
            // If the element's properties aren't set, get the values from the equivalent offset properties.
            if (typeof e.elemX == 'undefined') e.elemX = e.offsetX;
            if (typeof e.elemY == 'undefined') e.elemY = e.offsetY;
            return e;
        }
    };

    /**
    *
    * Method to initialize a range slider for mouse interaction.
    * @method
    * @param {selector} A valid selector indicate a range slider (should be unique).
    * @param {object literal} An object literal of values.
    * 
    * ### css
    *
    * syntax:
    *
    *  $(selector).css(style declaration, boolean);
    *
    * arguments:
    *
    * - style:string A valid CSS property/value declaration to add to an element.
    * 
    * @return {Style} Returns CSS property value pairs as inline cssText. 
    * 
    * example:
    *
    *  $("#item").css("font: bold 12pt/14pt Arial, Helvetica, Sans-serif;");
    *  $("#item").css("background-color: red; true");
    *
    */
    $.slider = function (selector, opts) {
        var thumb = $(selector + " > .thumb");
        var slider = $(selector);
        var thumbWidth = parseInt($.getStyle(thumb, "width"));
        var sliderWidth = parseInt($.getStyle(slider, "width"));
        var padding = parseInt($.getStyle(slider, "padding-right"));
        var border = parseInt($.getStyle(slider, "border-right-width"));
        sliderWidth -= padding;
        sliderWidth -= border;
        $.Drag.init(thumb, null, 0, sliderWidth - thumbWidth, opts["top"], opts["top"]);
        for (prop in opts) {
            if (prop === "onDrag") {
                thumb.onDrag = function () {
                    this.addClass("hover");
                    opts["onDrag"]();
                }
            }
            if (prop === "onDragEnd") {
                thumb.onDragEnd = function () {
                    this.removeClass("hover");
                    opts["onDragEnd"]();
                }
            }
        }
    };
    // Set up RGB values for the default state of sliders and color swatches.
    $.rgbColor = [121, 156, 230];
    $.hsvColor = [180, 50, 50];

    // Method to convert an RGB decimal value to hexadecimal.
    $.rgb2hex = function (hex) {
        if (hex === 0) {
            return "00";
        } else {
            return hex.toString(16);
        }
    };
    /**
    *
    * Method to set colors while the range slider's thumb is dragged.
    *
    */
    Element.prototype.setColorFromSlider = function (color) {
        // Make sure we don't go past an RGB value of 255.
        if ($.Drag.x > 255) {
            $.Drag.x = 255;
        }
        if (color === "red") {
            $.hsvColor[0] = Math.round(360 / 255 * $.Drag.x);
        }
        if (color === "green") {
            $.hsvColor[1] = Math.round(100 / 255 * $.Drag.x);
        }
        if (color === "blue") {
            $.hsvColor[2] = Math.round(100 / 255 * $.Drag.x);
        }
        $.rgbColor = HSV2RGB($.hsvColor);
        var barva = getNejblizsi($.rgbColor[0], $.rgbColor[1], $.rgbColor[2]);
        $("#nazev_barvy").text(barva[3] + " (" + barva[4] + ")");
        $("#rgbColor").css("background-color: rgb(" + $.rgbColor[0] + "," + $.rgbColor[1] + "," + $.rgbColor[2] + ")");
        $("#rgbResult").fill($.rgbColor[0] + ", " + $.rgbColor[1] + ", " + $.rgbColor[2]);
        $("#hexResult").fill("#" + $.rgb2hex($.rgbColor[0]) + $.rgb2hex($.rgbColor[1]) + $.rgb2hex($.rgbColor[2]));
        $("#" + color + "Slider").css("-webkit-background-size:" + ($.Drag.x + 1) + "px 9px, 100% 9px");
        $("#" + color + "Slider").style.MozBackgroundSize = ($.Drag.x + 1) + "px 9px, 100% 9px";
        $("#" + color + "Slider").css("background-size:" + ($.Drag.x + 1) + "px 9px, 100% 9px");
    };

    // Set up three sliders for Red, Green and Blue:
    $.slider("#redSlider", {
        onDrag: function () {
            $("#redSlider").setColorFromSlider("red");
        },
        // onDragEnd function necessary to remove hover state off of slider thumb when drag ends.
        onDragEnd: function () { },
        top: -6
    });
    $.slider("#greenSlider", {
        // onDragEnd function necessary to remove hover state off of slider thumb when drag ends. 
        onDrag: function () {
            $("#greenSlider").setColorFromSlider("green");
        },
        // onDragEnd function necessary to remove hover state off of slider thumb when drag ends.
        onDragEnd: function () { },
        top: -6
    });
    $.slider("#blueSlider", {
        onDrag: function () {
            $("#blueColor").setColorFromSlider("blue");
        },
        onDragEnd: function () { },
        top: -6
    });

    /**
    * Touch enabled support:
    */
    /**
    *
    * Method to set the colors of color swatches and width of the slider progress track when the slider thumb is dragged.
    */
    Element.prototype.setupSliderTouch = function (event) {
        event.preventDefault();
        var el = event.target;
        var touch = event.touches[0];
        curX = touch.pageX - this.parentNode.offsetLeft;
        if (curX <= 0) {
            curX = 0;
        }
        if (curX > 255) {
            curX = 255;
        }
    };
    Element.prototype.updateSliderTouch = function (color) {
        this.style.left = curX + 'px';


        if (color === "red") {
            $.hsvColor[0] = Math.round(360 / 255 * curX);
        }
        if (color === "green") {
            $.hsvColor[1] = Math.round(100 / 255 * curX);
        }
        if (color === "blue") {
            $.hsvColor[2] = Math.round(100 / 255 * curX);
        }
        $.rgbColor = HSV2RGB($.hsvColor);
        var barva = getNejblizsi($.rgbColor[0], $.rgbColor[1], $.rgbColor[2]);
        $("#nazev_barvy").text(barva[3] + " (" + barva[4] + ")");


        $("#" + color + "Slider").css("-webkit-background-size:" + (curX + 1) + "px 9px, 100% 9px");
        $("#" + color + "Slider").css("background-size:" + (curX + 1) + "px 9px, 100% 9px");

        $("#rgbColor").css("background-color: rgb(" + $.rgbColor[0] + "," + $.rgbColor[1] + "," + $.rgbColor[2] + ")");
        $("#rgbResult").fill($.rgbColor[0] + ", " + $.rgbColor[1] + ", " + $.rgbColor[2]);
        $("#hexResult").fill("#" + $.rgb2hex($.rgbColor[0]) + $.rgb2hex($.rgbColor[1]) + $.rgb2hex($.rgbColor[2]));
    };

    $("#redSlider > .thumb").bind('touchmove', function (event) {
        this.setupSliderTouch(event);
        this.updateSliderTouch("red");
    });
    $("#greenSlider > .thumb").bind('touchmove', function (event) {
        this.setupSliderTouch(event);
        this.updateSliderTouch("green");
    });
    $("#blueSlider > .thumb").bind('touchmove', function (event) {
        this.setupSliderTouch(event);
        this.updateSliderTouch("blue");
    });
    $$(".colorRow").forEach(function (row) {
        row.bind('touchmove', function (event) {
            if (row.hasClass("finalResult")) {
                return false;
            }
            //event.preventDefault();
        });
    });

    $$(".button").forEach(function (button) {
        button.bind("touchstart", function () {
            this.addClass("hover");
        });
    });
    $$(".button").forEach(function (button) {
        button.bind("touchend", function () {
            this.removeClass("hover");
        });
    });
});