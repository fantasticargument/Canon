window.onload = function fncOnLoad(){
	try {
		fncIncludeHeader();
		fncIncludeFooter();
		fncLoadResource();
		fncGenerateDynamicLink();
		fncResizeFrame();
		fncSearchBox("src_bg");
		document.getElementById("id_search").focus();
	} catch (e) {
	}
}
window.onresize = fncResizeFrame;
window.onunload = function(){};