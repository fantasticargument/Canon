window.onload = function fncOnLoad(){
	try{

		// print_category.html?chapter=[id]
		var strChapter = document.location.search.substring(9);
		strChapter = decodeURI(strChapter);

		// toc.jsonをロード
		var t = eval(toc);

		var strHtml = "";
		var arrHtml = new Array();
		var strTemp = "";
		var strDelimiterBegin	= "<!--CONTENT_START-->";
		var strDelimiterEnd		= "<!--CONTENT_END-->";

		// 印刷対象カテゴリーフラグ
		var bCurrentChapter;

		// toc.json要素分ループ
		for (var i = 0; i < t.length; i++) {

			// 指定されたカテゴリーのidと一致
			if (t[i].id == strChapter) {
				bCurrentChapter = true;

				// ウィンドウタイトルはカテゴリー名
				document.title = t[i].title;

			// カテゴリーが一致するので印刷対象
			} else if (	(bCurrentChapter)
				&&	(1 < t[i].level)
				&&	(t[i].href)
			) {

				// 目次にないトピックは印刷しない
				if (t[i].show_toc == "n") {
					continue;
				}

			// 印刷対象外
			} else {

				bCurrentChapter = false;

				// 以降処理不要
				if (bCurrentChapter) {
					break;
				}
				continue;
			}

			// AJAXによるコンテンツデータ収集
			if (document.all) {
				strTemp = fncGetPage("../contents/" + t[i].href);
			} else {
				strTemp = $.ajax({url:"../contents/" + t[i].href,async:false}).responseText;
			}

			// 不要部分の除去
			if (strTemp) {
				strTemp = strTemp.substring(
					strTemp.indexOf(strDelimiterBegin) + strDelimiterBegin.length + 27,
					strTemp.lastIndexOf(strDelimiterEnd) - 10
				);
				arrHtml.push(strTemp);
			}
		}

		// 収集したHTMLをページ内に配置
		strHtml = arrHtml.join("\t<div class=\"page_end\">&nbsp;</div>\n");
		document.body.innerHTML = strHtml;

		// 印刷命令
		window.print();

		// ウィンドウ終了
		window.close();

	} catch(e) {
	}
}