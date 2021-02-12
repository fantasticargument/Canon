function fncGetPage(pageURL){
	xmlhttp = createXMLHttp();
	if(xmlhttp){
		strReturnValue = null;
		xmlhttp.onreadystatechange = setPageData;
		xmlhttp.open('GET', pageURL, true);
		xmlhttp.send(null);
		if(strReturnValue){
			return strReturnValue;
		}
	}
}
function setPageData(){
	if(xmlhttp.readyState == 4){
		try{
			strReturnValue = xmlhttp.responseText;
		}catch(e){
		}
	}
}
function createXMLHttp(){
	try{
		return new ActiveXObject("Microsoft.XMLHTTP");
	}catch(e){
		try {
			return new XMLHttpRequest();
		}catch(e){
			return null;
		}
	}
	return null;
}
function fncSearchKeyDown(nKeyCode, strValue){
	try{
		if (!document.all) {
			if (nKeyCode == 13) {
				fncSearch();
			}
		}
		if (strValue == fncGetResourceByResourceId("enter_search_keyword")) {
			document.getElementById("id_search").value = "";
			document.getElementById("id_search").style.color = "#000000";
		}
	}catch(e){
	}
}
function fncSearch(){
	try{
		var strKeyword = document.getElementById("id_search").value;
		if (strKeyword == fncGetResourceByResourceId("enter_search_keyword")) {
			strKeyword = "";
		}
		var iWidth = fncGetConstantByName("search_window_width");
		var iLeft = 0;
		var iHeight = screen.height - 32;
		strKeyword = encodeURIComponent(strKeyword);
		var wnd = window.open(
			"../frame_htmls/search.html?conditions=" + strKeyword,
			"canon_search",
			"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=0,left=" + iLeft + ",height=" + iHeight
		);
	}catch(e){
	}
}
function fncSearchByGlossary(title){
	try{
		var strKeyword = title;
		var iWidth = fncGetConstantByName("search_window_width");
		var iLeft = 0;
		var iHeight = screen.height - 32;
		var wnd = window.open(
			"../frame_htmls/search.html?conditions=" + strKeyword,
			"canon_search",
			"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=0,left=" + iLeft + ",height=" + iHeight
		);
	}catch(e){
	}
}
function fncOpenSubWindow(strUrl, strTarget){
	try{
		if (strTarget == "_blank") {
			var wnd = window.open(
				strUrl,
				strTarget
			);
		} else {
			var iWidth = 640;
			var iHeight = 480;
			var iLeft = (screen.width / 2) - (iWidth / 2);
			var iTop = (screen.height / 2) - (iHeight / 2);
			var wnd = window.open(
				strUrl + "?sub=yes",
				strTarget,
				"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=" + iTop + ",left=" + iLeft + ",height=" + iHeight
			);
		}
		wnd.focus();
	}catch(e){
	}
}
function fncPrint(){
	try{
//		window.open(document.location.href + "?print=yes");
		window.print();
	}catch(e){
	}
}
function fncKeyPress(){
	try {
		if (event.keyCode == 27) {
			window.close();
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リンク名を元にtoc.jsonのhrefをたどる
// ------------------------------------------------------------------------------------------------
function fncGetTocHrefByLinkName(link_name) {
	try {

		// toc.jsonをロード
		var t = eval(toc);
		var nTLength = t.length;
		for (var i = 0; i < nTLength; i++) {

			// toc.link_name（旧仕様ではtoc.type）を取得
			var strTocLinkName;
			if (t[i].link_name) {
				strTocLinkName = t[i].link_name;
				if (strTocLinkName == "") {
					continue;
				}
			} else if (t[i].type) {
				strTocLinkName = t[i].type;
				if (strTocLinkName == "") {
					continue;
				}
			} else {
				continue;
			}

			// toc.link_nameに「::」が含まれる場合、
			//「::」から前の文字列は上位グループ名
			//「::」から後の文字列はカテゴリー名
			var strDivMark = "::";
			var nDivPosition = strTocLinkName.indexOf(strDivMark);

			// toc.link_nameからカテゴリー名を取得
			if (nDivPosition != -1) {
				strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
			}

			// toc.link_nameと要求するlink_nameが合致した場合は、toc.hrefを返す
			if (strTocLinkName == link_name) {
				return "../contents/" + t[i].href;
			}
		}
		return false;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リソースIDを元に値を取得
// ------------------------------------------------------------------------------------------------
function fncGetResourceByResourceId(resource_id) {
	try {
		var r = eval(resource);
		var nRLength = r.length;
		for (var i = 0; i < nRLength; i++) {

			if (r[i].id == resource_id) {
				return r[i].value;
			}
		}
		return "";
	} catch (e) {
	}
}
// ------------------------------------------------------------------------------------------------
// JSON定義を元にヘッダー項目を表示する
// ------------------------------------------------------------------------------------------------
function fncIncludeHeader(){
	try {
		if (header) {
			var arrHtml = new Array();
			var arrHeader = header.split(",");
			var nHeaderLength = arrHeader.length;
			for (var i = 0; i < nHeaderLength; i++) {
				switch (arrHeader[i]) {
					case "|" :
						arrHtml.push("<img class=\"header_vr\" src=\"../frame_images/hdr_vr.gif\" />");
						break;
					case "_SEARCH_" :
						arrHtml.push("<input type=\"text\" id=\"id_search\" accesskey=\"s\" onkeydown=\"fncSearchKeyDown(event.keyCode, this.value);\" /><button type=\"submit\" id=\"id_search_button\" accesskey=\"s\" onclick=\"fncSearch();\"></button>");
						break;
					default :
						arrHtml.push("<a id=\"id_link_" + arrHeader[i] + "\"></a>");
						break;
				}
			}
			document.getElementById("id_header_include").innerHTML = arrHtml.join("");
		}
	} catch (e) {
	}
}
// ------------------------------------------------------------------------------------------------
// JSON定義を元にフッター項目を表示する
// ------------------------------------------------------------------------------------------------
function fncIncludeFooter(){
	try {
		if (footer) {
			var arrHtml = new Array();
			var arrFooter = footer.split(",");
			var nFooterLength = arrFooter.length;
			for (var i = 0; i < nFooterLength; i++) {
				switch (arrFooter[i]) {
					case "|" :
						arrHtml.push("<img class=\"footer_vr\" src=\"../frame_images/ftr_vr.gif\" />");
						break;
					case "_PUBNO_" :
						arrHtml.push("<span id=\"id_res_pub_number\"></span>");
						break;
					default :
						arrHtml.push("<a id=\"id_link_" + arrFooter[i] + "\"></a>");
						break;
				}
			}
			document.getElementById("id_footer_include").innerHTML = arrHtml.join("");
		}
	} catch (e) {
	}
}
// ------------------------------------------------------------------------------------------------
// リソース定義をロードしてHTML内の対応する要素に値を代入する
// ------------------------------------------------------------------------------------------------
function fncLoadResource(){
	try {

		var r = eval(resource);
		var nRLength = r.length;
		for (var i = 0; i < nRLength; i++) {

			// リソースIDに合致するbody側要素を発見した時は、内容をリソースの値に書き換える
			if (document.getElementById("id_res_" + r[i].id)) {
				document.getElementById("id_res_" + r[i].id).innerHTML = r[i].value;
			}

			// <title>タグの内容をロード
			if (document.title == "") {
				if (r[i].id == "title") {
					document.title = r[i].value;
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 動的リンク処理
// ------------------------------------------------------------------------------------------------
function fncGenerateDynamicLink(){
	try {

		// ----------------------------------------------------------------------------------------
		// リンクマッピング定義のロード
		// ----------------------------------------------------------------------------------------
		var l = eval(link);
		var nLLength = l.length;
		for (var i = 0; i < nLLength; i++) {

			var link_name = l[i].link_name;
			var link_target = l[i].link_target;
			var link_resource = l[i].link_resource;
			if (!link_resource) {
				link_resource = link_name;
			}

			// link_nameに合致するbody側要素がある場合
			var objLinkItem = document.getElementById("id_link_" + link_name);
			if (objLinkItem) {

				// リンク先を取得
				var link_href = fncGetTocHrefByLinkName(link_name);

				// toc.jsonから取得できなかった場合は、link.json内のhrefを採用
				// 末端コンテンツ以外にジャンプさせる場合はlink.json内にて記述
				if (!link_href) {
					link_href = l[i].link_href;
				}
				objLinkItem.link_href = link_href;

				// タグ種類によって振る舞いを変える
				var strNodeName = objLinkItem.nodeName.toLowerCase();

				// <a>
				if (strNodeName == "a") {

					// <a>[resource]</a>
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.innerHTML = strInnerHTML;
					}

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						// <a href="[link_href]" class="self">[resource]</a>
						objLinkItem.href = link_href;
						objLinkItem.className = "self";

					// 別ウィンドウにリンク先を表示
					} else {

						// <a href="#" onclick="fncOpenSubWindow();" class="[link_target]">[resource]</a>
						objLinkItem.href = "#";
						objLinkItem.link_target = link_target;
						if (link_target == "canon_sub_window") {
							objLinkItem.className = "sub_window";
						}
						objLinkItem.onclick = function(){
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}

				// <button>
				} else if (strNodeName == "button") {

					// <button title="[resource]"></button>
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.title = strInnerHTML;
					}

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						// <button onclick="fncOpenSubWindow();"></button>
						objLinkItem.onclick = function(){
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						// <button onclick="fncOpenSubWindow();"></button>
						objLinkItem.link_target = link_target;
						objLinkItem.onclick = function(){
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}

					if (!objLinkItem.childNodes[0]) {

						// ボタン内の通常画像
						objLinkItem.innerHTML = "<img src=\"../frame_images/" + link_name + "_out.gif\" />";
						objLinkItem.link_name = link_name;

						// イベント定義
						objLinkItem.onmouseover = function(){
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_over.gif";
						};
						objLinkItem.onmouseout = function(){
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_out.gif";
						};
					}

				// <img>
				} else if (strNodeName == "img") {

					// <img title="[resource]" />
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.title = strInnerHTML;
					}

					objLinkItem.style.cursor = "Pointer";

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						objLinkItem.onclick = function(){
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						objLinkItem.link_target = link_target;
						objLinkItem.onclick = function(){
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// ウィンドウリサイズ時のフレーム要素のサイズ調整
// ------------------------------------------------------------------------------------------------
function fncResizeFrame(){
	try {
		var obj = window;
		if (window.opera) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		} else if (document.all) {
			var w = obj.document.body.clientWidth;
			var h = obj.document.body.clientHeight;
		} else if (document.getElementById) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		}
		if (document.getElementById("id_body")) {
			document.getElementById("id_body").style.height = h - 70 + "px";
			document.getElementById("id_body").style.width = w + "px";
		}
		if (document.getElementById("id_footer")) {
			document.getElementById("id_footer").style.top = h - 26 + "px";
			document.getElementById("id_footer").style.width = w + "px";
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 検索条件入力欄の動作定義
// ------------------------------------------------------------------------------------------------
function fncSearchBox(strBaseBackgroundName){
	try {

		// ロールオーバー
		document.getElementById("id_search").onmouseover = function(){
			this.style.backgroundImage = "Url(\"../frame_images/" + strBaseBackgroundName + "_over.gif\")";
		}

		// ロールアウト
		document.getElementById("id_search").onmouseout = function(){
			this.style.backgroundImage = "Url(\"../frame_images/" + strBaseBackgroundName + "_out.gif\")";
		}

		// 検索条件入力欄の初期表示
		if (document.getElementById("id_search").value == "") {
			document.getElementById("id_search").value = fncGetResourceByResourceId("enter_search_keyword");
			document.getElementById("id_search").style.color = "#808080";
		}

		if (document.getElementById("id_search").value == fncGetResourceByResourceId("enter_search_keyword")) {
			document.getElementById("id_search").style.color = "#808080";
		}

		// クリック時に初期表示のメッセージを隠す
		document.getElementById("id_search").onclick = function(){
			if (this.value == fncGetResourceByResourceId("enter_search_keyword")) {
				this.value = "";
				document.getElementById("id_search").style.color = "#000000";
			}
		}

		// 検索条件が入力されていない場合は初期表示に戻す
		document.getElementById("id_search").onblur = function(){
			if (this.value == "") {
				this.value = fncGetResourceByResourceId("enter_search_keyword");
				document.getElementById("id_search").style.color = "#808080";
			}
		}
	} catch (e) {
	}
}

function fncGetConstantByName(constant_name){
	try {
		var o = eval(constant);
		return o[0][constant_name];
	} catch (e) {
	}
}