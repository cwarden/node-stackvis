var details, svg;
function init(evt) {
	details = document.getElementById("details").firstChild;
	svg = document.getElementsByTagName("svg")[0];
}
function s(info) { details.nodeValue = info; }
function c() { details.nodeValue = ' '; }
function find_child(parent, name, attr) {
	var children = parent.childNodes;
	for (var i=0; i<children.length;i++) {
		if (children[i].tagName == name)
			return (attr != undefined) ? children[i].attributes[attr].value : children[i];
	}
	return;
}
function orig_save(e, attr, val) {
	if (e.attributes["_orig_"+attr] != undefined) return;
	if (e.attributes[attr] == undefined) return;
	if (val == undefined) val = e.attributes[attr].value;
	e.setAttribute("_orig_"+attr, val);
}
function orig_load(e, attr) {
	if (e.attributes["_orig_"+attr] == undefined) return;
	e.attributes[attr].value = e.attributes["_orig_"+attr].value;
	e.removeAttribute("_orig_"+attr);
}
function update_text(e) {
	var r = find_child(e, "rect");
	var t = find_child(e, "text");
	var w = parseFloat(r.attributes["width"].value) -3;
	var txt = find_child(e, "title").textContent.replace(/\([^(]*\)/,"");
	t.attributes["x"].value = parseFloat(r.attributes["x"].value) +3;
	// Smaller than this size won't fit anything
	if (w < 2*12*0.59) {
		t.textContent = "";
		return;
	}
	t.textContent = txt;
	// Fit in full text width
	if (/^ *$/.test(txt) || t.getSubStringLength(0, txt.length) < w)
		return;
	for (var x=txt.length-2; x>0; x--) {
		if (t.getSubStringLength(0, x+2) <= w) {
			t.textContent = txt.substring(0,x) + "..";
			return;
		}
	}
	t.textContent = "";
}
function zoom_reset(e) {
	if (e.attributes != undefined) {
		orig_load(e, "x");
		orig_load(e, "width");
	}
	if (e.childNodes == undefined) return;
	for(var i=0, c=e.childNodes; i<c.length; i++) {
		zoom_reset(c[i]);
	}
}
function zoom_child(e, x, ratio) {
	if (e.attributes != undefined) {
		if (e.attributes["x"] != undefined) {
			orig_save(e, "x");
			e.attributes["x"].value = (parseFloat(e.attributes["x"].value) - x - 10) * ratio + 10;
			if(e.tagName == "text") e.attributes["x"].value = find_child(e.parentNode, "rect", "x") + 3;
		}
		if (e.attributes["width"] != undefined) {
			orig_save(e, "width");
			e.attributes["width"].value = parseFloat(e.attributes["width"].value) * ratio;
		}
	}
	if (e.childNodes == undefined) return;
	for(var i=0, c=e.childNodes; i<c.length; i++) {
		zoom_child(c[i], x-10, ratio);
	}
}
function zoom_parent(e) {
	if (e.attributes) {
		if (e.attributes["x"] != undefined) {
			orig_save(e, "x");
			e.attributes["x"].value = 10;
		}
		if (e.attributes["width"] != undefined) {
			orig_save(e, "width");
			e.attributes["width"].value = parseInt(svg.width.baseVal.value) - (10*2);
		}
	}
	if (e.childNodes == undefined) return;
	for(var i=0, c=e.childNodes; i<c.length; i++) {
		zoom_parent(c[i]);
	}
}
function zoom(node) {
	var attr = find_child(node, "rect").attributes;
	var width = parseFloat(attr["width"].value);
	var xmin = parseFloat(attr["x"].value);
	var xmax = parseFloat(xmin + width);
	var ymin = parseFloat(attr["y"].value);
	var ratio = (svg.width.baseVal.value - 2*10) / width;
	// XXX: Workaround for JavaScript float issues (fix me)
	var fudge = 0.0001;
	var unzoombtn = document.getElementById("unzoom");
	unzoombtn.style["opacity"] = "1.0";
	var el = document.getElementsByTagName("g");
	for(var i=0;i<el.length;i++){
		var e = el[i];
		var a = find_child(e, "rect").attributes;
		var ex = parseFloat(a["x"].value);
		var ew = parseFloat(a["width"].value);
		// Is it an ancestor
		var upstack = parseFloat(a["y"].value) > ymin;
		if (upstack) {
			// Direct ancestor
			if (ex <= xmin && (ex+ew+fudge) >= xmax) {
				e.style["opacity"] = "0.5";
				zoom_parent(e);
				e.onclick = function(e){unzoom(); zoom(this);};
				update_text(e);
			}
			// not in current path
			else
				e.style["display"] = "none";
		}
		// Children maybe
		else {
			// no common path
			if (ex < xmin || ex + fudge >= xmax) {
				e.style["display"] = "none";
			}
			else {
				zoom_child(e, xmin, ratio);
				e.onclick = function(e){zoom(this);};
				update_text(e);
			}
		}
	}
}
function unzoom() {
	var unzoombtn = document.getElementById("unzoom");
	unzoombtn.style["opacity"] = "0.0";
	var el = document.getElementsByTagName("g");
	for(i=0;i<el.length;i++) {
		el[i].style["display"] = "block";
		el[i].style["opacity"] = "1";
		zoom_reset(el[i]);
		update_text(el[i]);
	}
}
