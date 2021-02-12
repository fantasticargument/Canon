var c = new Array();
window.onload = function fncOnLoad(){
	try {

		// リソース定義のマッピング
		fncLoadResource();

		// ウィンドウ位置を画面左上に移動
		with (window) {
			moveTo(0, 0);
			resizeTo(fncGetConstantByName("search_window_width"), screen.height - 32);
			self.focus();
		}

		// ----------------------------------------------------------------------------------------
		// 検索条件
		// ----------------------------------------------------------------------------------------

		// メインウィンドウから指定された検索条件を取得
		var strConditions = document.location.search;
		strConditions = strConditions.substring(12);
		document.getElementById("id_search").value = decodeURIComponent(strConditions);

		fncSearchBox("src_w_bg");

		// 検索ボタンにクリックイベントをセット
		document.getElementById("id_search_button").onclick = function(){
			fncDoSearch(1);
		}

		// ----------------------------------------------------------------------------------------
		// 検索範囲を表示・検索範囲を隠す (デフォルト:[検索範囲を表示]を選択)
		// ----------------------------------------------------------------------------------------
		document.getElementById("id_select_categories").innerHTML = "<a href=\"#\">" + fncGetResourceByResourceId("select_categories") + "<img src=\"../frame_images/src_cat_show.gif\" /></a>";
		document.getElementById("id_select_categories").onclick = fncToggleCategories;

		// ----------------------------------------------------------------------------------------
		// すべてのカテゴリーから検索・以下のカテゴリーから検索 (デフォルト:非表示)
		// ----------------------------------------------------------------------------------------
		document.getElementById("id_from_all_label").innerHTML = fncGetResourceByResourceId("categories_from_all");
		document.getElementById("id_from_all_label").onclick = function(){
			fncSelectCategoryFromAll();
		}
		document.getElementById("id_from_all").onclick = function(){
			fncSelectCategoryFromAll();
		}
		document.getElementById("id_from_below_label").innerHTML = fncGetResourceByResourceId("categories_from_below");
		document.getElementById("id_categories_from").style.display = "None";

		// ----------------------------------------------------------------------------------------
		// カテゴリー一覧 (デフォルト:非表示)
		// ----------------------------------------------------------------------------------------

		// カテゴリー一覧抽出のため目次情報をロード
		// toc.jsonのlevelが「1」のノードは「カテゴリー」とする
		var t = eval(toc);
		var nTLength = t.length;
		for (var i = 0; i < nTLength; i++) {

			// カテゴリー情報を抽出
			if (	(t[i].level == 1)
				&&	(t[i].show_toc != "n")
			) {
				c.push(t[i]);
			}
		}
		var nCLength = c.length;
		var arrCategoryHtml = new Array();

		// カテゴリーが5項目以下の場合、1列で表示
		if (nCLength <= 5) {
			for (var i = 0; i < nCLength; i++) {
				arrCategoryHtml.push(fncGenerateCategoryCheckbox(c[i].id, c[i].title));
			}

		// カテゴリーが6項目以上の場合、2列で表示
		} else {
			var nCategoryColumnSize = Math.ceil(nCLength / 2);
			arrCategoryHtml.push("<table><tr><td>");
			for (var i = 0; i < nCategoryColumnSize; i++) {
				arrCategoryHtml.push(fncGenerateCategoryCheckbox(c[i].id, c[i].title));
			}
			arrCategoryHtml.push("</td><td>");
			for (var i = nCategoryColumnSize; i < nCLength; i++) {
				arrCategoryHtml.push(fncGenerateCategoryCheckbox(c[i].id, c[i].title));
			}
			arrCategoryHtml.push("</td></tr></table>");
		}

		// カテゴリー一覧を配置 (デフォルトは非表示)
		document.getElementById("id_categories").innerHTML = arrCategoryHtml.join("");
		document.getElementById("id_categories").style.display = "None";

		// ----------------------------------------------------------------------------------------
		// ステータスバー
		// ----------------------------------------------------------------------------------------

		// 閉じるボタンの動作定義
		document.getElementById("id_close_button").innerHTML = fncGetResourceByResourceId("close");
		document.getElementById("id_close_button").accessKey = "c";
		document.getElementById("id_close_button").onclick = function(){
			window.close();
		}

		// 検索の実行
		fncDoSearch(1);

		// 検索結果表示領域のサイズ調整
		fncOnResize();

	}catch(e){
	}
}

// イベント処理
document.onkeypress = fncKeyPress;
window.onresize = fncOnResize;

// 検索結果欄の高さを動的に計算
function fncOnResize(){
	try{
		var obj = window;
		if(window.opera){
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		}else if(document.all){
			var w = obj.document.body.clientWidth;
			var h = obj.document.body.clientHeight;
		}else if(document.getElementById){
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		}
		var nResultsHeight = h - (document.getElementById("id_conditions").offsetHeight + document.getElementById("id_categories_from").offsetHeight + document.getElementById("id_categories").offsetHeight + document.getElementById("id_status").offsetHeight) + "px";
		document.getElementById("id_results").style.height = nResultsHeight;
	}catch(e){
	}
}

// 検索処理
function fncDoSearch(nPage){
	try {

		// ----------------------------------------------------------------------------------------
		// 検索条件の取得
		// ----------------------------------------------------------------------------------------

		// 入力された検索条件を取得
		var strSearchTexts = document.getElementById("id_search").value;

		// 検索条件表示用にJSONエスケープしない状態も残しておく（HTMLエスケープは必要）
		var strSearchTextsOriginal = strSearchTexts;

		// 検索条件が指定されていない場合は実行しない
		if (	(strSearchTexts == "")
			||	(strSearchTexts == fncGetResourceByResourceId("enter_search_keyword"))
		) {
			return;
		}

		// 検索条件をエスケープ
		var regexpEscapeJson = /([$()\-^\\\|\[\]{},:+*.?])/g;
		if (regexpEscapeJson.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeJson, "\\$1");
		}
		var regexpEscapeHtmlAmp = /(&)/g;
		if (regexpEscapeHtmlAmp.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlAmp, "&amp;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlAmp, "&amp;");
		}
		var regexpEscapeHtmlLt = /(<)/g;
		if (regexpEscapeHtmlLt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlLt, "&lt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlLt, "&lt;");
		}
		var regexpEscapeHtmlGt = /(>)/g;
		if (regexpEscapeHtmlGt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlGt, "&gt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlGt, "&gt;");
		}
		var regexpEscapeHtmlQuot = /(\")/g;
		if (regexpEscapeHtmlQuot.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlQuot, "&quot;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlQuot, "&quot;");
		}

		// 複数指定された検索条件をスペースで区切る(全角スペースも許容)
		var res = / |　/;
		var arrSearchText = strSearchTexts.split(res);
		var arrSearchTextOriginal = strSearchTextsOriginal.split(res);

		// ----------------------------------------------------------------------------------------
		// 検索対象の絞込み
		// ----------------------------------------------------------------------------------------

		// カテゴリー絞込み状況を確認
		var objCategoryCheckboxes = document.getElementById("id_categories").getElementsByTagName("input");
		var nCheckboxLength = objCategoryCheckboxes.length;
		var bChecked = false;
		var arrSelectedCategories = new Array();
		var arrUnSelectedCategories = new Array();

		// チェックボックスの状態を調査
		for (var i = 0; i < nCheckboxLength; i++) {
			if (objCategoryCheckboxes[i].checked) {
				bChecked = true;
				arrSelectedCategories.push(objCategoryCheckboxes[i].id);
			} else {
				arrUnSelectedCategories.push(objCategoryCheckboxes[i].id);
			}
		}

		// ひとつもカテゴリーが選択されていない場合
		// または「すべてのカテゴリーから」が選択されている場合は、
		// すべてのカテゴリーが検索対象
		var strSelectedCategories = "";
		if (arrSelectedCategories.length == nCheckboxLength) {
			strSelectedCategories = arrSelectedCategories.join(",");
			strSelectedCategoriesCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + fncGetResourceByResourceId("search_scope_all") + fncGetResourceByResourceId("search_scope_category") + "</div>";
		} else if (	(arrSelectedCategories.length != 0)
			&&	(!document.getElementById("id_from_all").checked)
		) {
			strSelectedCategories = arrSelectedCategories.join(",");
			strSelectedCategoriesCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + "<b>" + arrSelectedCategories.length + "</b>" + fncGetResourceByResourceId("search_scope_category") + "</div>";
		} else {
			strSelectedCategories = arrUnSelectedCategories.join(",");
			strSelectedCategoriesCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + fncGetResourceByResourceId("search_scope_all") + fncGetResourceByResourceId("search_scope_category") + "</div>";
		}

		// ----------------------------------------------------------------------------------------
		// 検索結果表示方法の定義
		// ----------------------------------------------------------------------------------------
		var iShowAround = fncGetConstantByName("search_show_around");
		var iShowAroundBefore = iShowAround;
		var iShowAroundAfter = iShowAround;
		var iShowResultCount = fncGetConstantByName("search_show_result_count");
		var iPageMaxRange = fncGetConstantByName("search_page_max_range"); // [2][3][4][5][6]
		var iPageRangeLeft = parseInt(iPageMaxRange / 2);
		var iPageRangeRight = parseInt(iPageMaxRange / 2);

		// 変数の初期化
		var strResultAll = "";
		var iFound = 0;
		var strPrevCategoryId = "";
		var arrResults = new Array();

		// 検索条件の表示
		arrResults.push(strSelectedCategoriesCount);
		var arrResultConditions = new Array();
		var nSearchTextLength = arrSearchTextOriginal.length;
		arrResultConditions.push("<div class=\"search_result_contidions\">");
		arrResultConditions.push(fncGetResourceByResourceId("search_result_contidions"));

		// 10種類のカラーバリエーションを循環
		var nMarkerColor = 0;
		for (var i = 0; i < nSearchTextLength; i++) {
			arrResultConditions.push("<span class=\"hit hit_" + nMarkerColor + "\">");
			arrResultConditions.push(arrSearchTextOriginal[i]);
			arrResultConditions.push("</span> ");
			nMarkerColor++;
			if (nMarkerColor >= 10) {
				nMarkerColor = 0;
			}
		}
		arrResultConditions.push("</div>");
		arrResults.push(arrResultConditions.join(""));

		// ----------------------------------------------------------------------------------------
		// 検索先情報 (search.json) の取得
		// ----------------------------------------------------------------------------------------
		var s = eval(search);

		// 検索先情報分ループ
		var nSLength = s.length;
		for (var i = 0; i < nSLength; i++) {

			// 検索先情報の取得
			var body = s[i].body;			// 本文
			var toc_id = s[i].toc_id;		// ID
			var title = s[i].title;			// タイトル
			var category = s[i].category;	// カテゴリーID

			// 本文が空ならスキップ
			if (!body) {
				continue;
			}

			// 検索対象カテゴリーかどうか
			var rec = new RegExp("(" + category + ")", "i");
			if (rec.exec(strSelectedCategories) == null) {
				continue;
			}

			// AND検索処理：指定検索条件分ループ
			var strResultTopic = "";
			var nSearchTextLength = arrSearchText.length;
			var arrSummaryText = new Array();
			for (var j = 0; j < nSearchTextLength; j++) {

				var strSearchText = arrSearchText[j];

				// --------------------------------------------------------------------------------
				// 検索実行
				// --------------------------------------------------------------------------------
				var re = new RegExp("(" + strSearchText + ")", "i");

				if (re.exec(body) == null) {

					// ヒット無し
					break;

				} else {

					// はじめに見つかった位置を調べる
					var iFoundPosition = body.search(re);
					if (iFoundPosition != -1) {

						// ------------------------------------------------------------------------
						// 実体参照文字列を除外する
						// ------------------------------------------------------------------------

						// ヒット位置から前方のテキストの末尾の「&」を探す
						var strAmpAfter = "";
						var strBeforeFound = body.substring(0, iFoundPosition);
						var nAmpAfter = strBeforeFound.lastIndexOf("&");
						if (strSearchText != "&") {
							if (nAmpAfter != -1) {
								strAmpAfter = strBeforeFound.substring(nAmpAfter);
							}
						}

						// ヒット位置から後方のテキストの最初の「;」を探す
						var strSemicolonBefore = "";
						var strAfterFound = body.substring(iFoundPosition + strSearchText.length);
						var nSemicolonBefore = strAfterFound.indexOf(";");
						if (strSearchText != ";") {
							if (nSemicolonBefore != -1) {
								strSemicolonBefore = strAfterFound.substring(0, nSemicolonBefore + 1);
							}
						}

						// 文字列を結合してみる
						var strIsEntity = strAmpAfter + strSearchText + strSemicolonBefore;
						
						// 実体参照として成立した場合は、ヒット取消
						if (	(strIsEntity == "&amp;")
							||	(strIsEntity == "&lt;")
							||	(strIsEntity == "&gt;")
							||	(strIsEntity == "&quot;")
						) {
							break;
						}

						// ------------------------------------------------------------------------
						// はじめに見つかった付近のテキストを抽出
						// ------------------------------------------------------------------------
						var strAroundText = body.substring(
							iFoundPosition - iShowAroundBefore,
							iFoundPosition + iShowAroundAfter
						);

						// 切り出し後の先頭の文字がタイ語の声調記号の場合は除去する
						while (1) {
							if (strAroundText.substring(0, 1).match(/[\u0E31]|[\u0E47-\u0E4E]|[\u0E34-\u0E3A]/) != null) {
								strAroundText = strAroundText.substring(1);
							} else {
								break;
							}
						}
						arrSummaryText.push(strAroundText);
					}
				}

				// 複数指定されたすべての検索条件にヒット
				if (j == arrSearchText.length - 1) {

					// ヒット数カウントアップ
					iFound ++;

					// ページ範囲内かどうかの確認
					if (	(nPage * iShowResultCount >= iFound + 0)
						&&	(nPage * iShowResultCount - iShowResultCount < iFound + 0)
					) {
					} else {
						continue;
					}

					// サマリーを連結
					var strSummaryTexts = arrSummaryText.join("...");

					// マーキング
					// 10種類のカラーバリエーションを循環
					var nMarkerColor = 0;
					for (var k = 0; k < nSearchTextLength; k++) {

						// 1桁数字を検索した場合にカラーバリエーションクラス名まで文字列置換されてしまうことを防ぐ
						// 0-9の代わりにU+2080(Subscript Zero)-U+2089(Subscript Nine)を使用する
						switch (nMarkerColor) {
							case 0:
								strMarkerColor = "₀";
								break;
							case 1:
								strMarkerColor = "₁";
								break;
							case 2:
								strMarkerColor = "₂";
								break;
							case 3:
								strMarkerColor = "₃";
								break;
							case 4:
								strMarkerColor = "₄";
								break;
							case 5:
								strMarkerColor = "₅";
								break;
							case 6:
								strMarkerColor = "₆";
								break;
							case 7:
								strMarkerColor = "₇";
								break;
							case 8:
								strMarkerColor = "₈";
								break;
							case 9:
								strMarkerColor = "₉";
								break;
						}

						var strSearchText = arrSearchText[k];

						// 見つかった文字列にマーキング
						var rem = new RegExp("(" + strSearchText + ")", "gi");
						strSummaryTexts = strSummaryTexts.replace(rem, function($1, $2, $3){

							// マーキングタグ自体が検索条件に合致し文字列置換されることを防ぐ
							var strMarkupText = "⁅" + strMarkerColor + $1 + "⁆";
							return strMarkupText;
						});

						nMarkerColor++;
						if (nMarkerColor >= 10) {
							nMarkerColor = 0;
						}
					}

					// マーキング箇所にタグを適用
					var retb = new RegExp("⁅([₀₁₂₃₄₅₆₇₈₉])", "g");
					var rete = new RegExp("⁆", "g");
					strSummaryTexts = strSummaryTexts.replace(retb, "<span id=\"id_hit\" class=\"hit hit_$1\">");
					strSummaryTexts = strSummaryTexts.replace(rete, "</span>");
					strSummaryTexts = strSummaryTexts.replace(/₀/g,"0");
					strSummaryTexts = strSummaryTexts.replace(/₁/g,"1");
					strSummaryTexts = strSummaryTexts.replace(/₂/g,"2");
					strSummaryTexts = strSummaryTexts.replace(/₃/g,"3");
					strSummaryTexts = strSummaryTexts.replace(/₄/g,"4");
					strSummaryTexts = strSummaryTexts.replace(/₅/g,"5");
					strSummaryTexts = strSummaryTexts.replace(/₆/g,"6");
					strSummaryTexts = strSummaryTexts.replace(/₇/g,"7");
					strSummaryTexts = strSummaryTexts.replace(/₈/g,"8");
					strSummaryTexts = strSummaryTexts.replace(/₉/g,"9");

					// ------------------------------------------------------------------------
					// 段落記号をスタイリング
					// ------------------------------------------------------------------------
					strSummaryTexts = strSummaryTexts.replace(/¶+/g, "<span style=\"color:#C0C0C0\"><img src=\"../frame_images/src_para.gif\" /></span>");

					// カテゴリーの表示（同一カテゴリーが続く限りは表示しない）
					if (strPrevCategoryId != category) {
						arrResults.push("<h1>" + fncGetTitle(category) + "</h1>");
						strPrevCategoryId = category;
					}
					arrResults.push("<div class=\"topic_title\"><img src=\"../contents/styles/style000/style_link_to_upper.gif\" />&nbsp;<a href=\"javascript:fncOpenTopic('" + toc_id + "', '" + strSearchTexts + "');void(0);\">" + title + "</a></div><div class=\"topic_summary\">..." + strSummaryTexts + "...</div>");
				}
			}
		}

		// 検索結果をHTMLに貼り付け
		document.getElementById("id_results").innerHTML = arrResults.join("");

		// 検索条件欄を選択状態にし、次に検索しやすいようにする
		document.getElementById("id_search").select();

		// ----------------------------------------------------------------------------------------
		// 検索結果ステータス処理
		// ----------------------------------------------------------------------------------------
		var arrStatus = new Array();

		arrStatus.push("<span><b>" + iFound + "</b> " + fncGetResourceByResourceId("search_found") + "&nbsp;&nbsp;&nbsp;");

		// 前の検索結果ページに戻るリンク
		if (nPage > 1) {
			arrStatus.push("<a href=\"#\" accesskey=\"p\" class=\"previous_active\" onclick=\"fncDoSearch(" + (nPage - 1) + ");\">" + fncGetResourceByResourceId("search_prev") + "</a> ");
		} else {
			arrStatus.push("<a>" + fncGetResourceByResourceId("search_prev") + "</a> ");
		}

		// 全体ページ数
		var nPageSize = parseInt(iFound / iShowResultCount);
		if (iFound % iShowResultCount != 0) {
			nPageSize ++;
		}

		// 各ページへのリンク作成
		var nStartPage = 1;
		var nEndPage = nPageSize;

		if (nPage - iPageRangeLeft > 1) {
			nStartPage = nPage - iPageRangeLeft;
		}

		// ページ数が5以下の場合
		if (iPageMaxRange >= nPageSize) {
			nEndPage = nPageSize;
			nStartPage = 1;

		// 現在ページから2ページ先が5ページ以下の場合
		} else if (nPage + iPageRangeRight <= iPageMaxRange) {
			nEndPage = iPageMaxRange;

		// 現在ページから2ページ先にページがない場合
		} else if (nPage + iPageRangeRight >= nPageSize) {
			nEndPage = nPageSize;
			nStartPage = nEndPage - iPageMaxRange + 1;
		} else {
			nEndPage = nPage + iPageRangeRight;
		}

		for (var i = nStartPage; i <= nEndPage; i++) {

			// 現在ページ
			if (nPage == i) {
				arrStatus.push("<a href=\"#\" class=\"page_current\" onclick=\"fncDoSearch(" + i + ");\"><span>" + i + "</span></a>");
			} else {
				arrStatus.push("<a href=\"#\" class=\"page\" onclick=\"fncDoSearch(" + i + ");\"><span>" + i + "</span></a>");
			}
		}

		// 次の検索結果ページに戻るリンク
		if ((nPage + 1) <= nPageSize) {
			arrStatus.push(" <a href=\"#\" accesskey=\"n\" class=\"next_active\" onclick=\"fncDoSearch(" + (nPage + 1) + ");\">" + fncGetResourceByResourceId("search_next") + "</a>");
		} else {
			arrStatus.push(" <a>" + fncGetResourceByResourceId("search_next") + "</a>");
		}
		arrStatus.push("</span>");

		// 検索結果ステータスをHTMLに貼り付け
		document.getElementById("id_pages").innerHTML = arrStatus.join("");
	} catch (e) {
	}
}
function fncOpenTopic(toc_id, text){
	try {
		text = encodeURIComponent(text);
		var strFilePath = "../contents/" + toc_id + ".html?search=" + text;
		window.open(strFilePath, "canon_main_window");
	} catch (e) {
		window.open(strFilePath);
	}
}
function fncGetTitle(toc_id){
	try {
		var nCLength = c.length;
		for (var i = 0; i < nCLength; i++) {
			if (c[i].id == toc_id) {
				return c[i].title;
			}
		}
	} catch (e) {
	}
}
function fncToggleCategories(){
	try{
		if (document.getElementById("id_categories")) {
			if (document.getElementById("id_categories").style.display.toLowerCase() != "none") {
				document.getElementById("id_categories").style.display = "None";
				document.getElementById("id_categories_from").style.display = "None";
				document.getElementById("id_select_categories").innerHTML = "<a href=\"#\">" + fncGetResourceByResourceId("select_categories") + "<img src=\"../frame_images/src_cat_show.gif\" /></a>";
			} else {
				document.getElementById("id_categories").style.display = "Block";
				document.getElementById("id_categories_from").style.display = "Block";
				document.getElementById("id_select_categories").innerHTML = "<a href=\"#\">" + fncGetResourceByResourceId("hide_categories") + "<img src=\"../frame_images/src_cat_hide.gif\" /></a>";
			}
			fncOnResize();
		}
	}catch(e){
	}
}
function fncGenerateCategoryCheckbox(strId, strTitle){
	try {
		return "<div><input class=\"input_category\" type=\"checkbox\" id=\"" + strId + "\" onclick=\"fncSelectCategoryFromBelow();\" /><label for=\"" + strId + "\" title=\"" + strTitle + "\">" + strTitle + "</label></div>";
	} catch (e) {
	}
}
function fncSelectCategoryFromBelow(){
	try {
		document.getElementById("id_from_below").checked = true;
	} catch (e) {
	}
}
function fncSelectCategoryFromAll(){
	try {

		// チェックボックスをすべてOFFにする
		var objCategoryCheckboxes = document.getElementById("id_categories").getElementsByTagName("input");
		var nCheckboxLength = objCategoryCheckboxes.length;
		for (var i = 0; i < nCheckboxLength; i++) {
			objCategoryCheckboxes[i].checked = false;
		}
	} catch (e) {
	}
}