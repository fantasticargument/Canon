window.onload = function fncOnLoad(){
	try{
		var strLangCode = fncGetConstantByName("lang_code");
		if (strLangCode) {
			document.body.lang = strLangCode;
		}

		// 別ウィンドウにロードされた場合の処理
		if (document.location.search.indexOf("?sub=yes") != -1) {

			// 別ウィンドウ用スタイル定義にCSSを切換える
			var objLink = document.getElementsByTagName("link");
			var nLinkLength = objLink.length;

			for (var i = 0; i < nLinkLength; i++) {
				if (objLink[i].href.indexOf("frame_style.css") != -1) {
					objLink[i].disabled = true;
				}
				if (objLink[i].href.indexOf("frame_sub.css") != -1) {
					objLink[i].disabled = false;
				}
			}

			// 別ウィンドウにロードされた場合、閉じるボタンを末尾に追加
			// <div class="close"></div>
			var objCloseDiv = document.createElement("div");
			objCloseDiv.className = "close";
			objCloseDiv.id = "id_close";

			// <button class="close" onclick="" accesskey="c">[close]</button>
			var objCloseButton = document.createElement("button");
			objCloseButton.onclick = function(){
				window.close();
			}
			objCloseButton.className = "close";
			objCloseButton.innerHTML = fncGetResourceByResourceId("close");
			objCloseButton.accessKey = "c";

			// <div class="close">
			//	<button class="close" onclick="" accesskey="c">[close]</button>
			// </div>
			objCloseDiv.appendChild(objCloseButton);
			document.getElementById("id_content").appendChild(objCloseDiv);
			document.onkeypress = fncKeyPress;

			fncOnResize();

			// 以降の処理（リソースのロード、目次生成など）不要
			return;

		} else {
			var objLink = document.getElementsByTagName("link");
			var nLinkLength = objLink.length;

			for (var i = 0; i < nLinkLength; i++) {
				if (objLink[i].href.indexOf("frame_style.css") != -1) {
					objLink[i].disabled = false;
				}
				if (objLink[i].href.indexOf("frame_sub.css") != -1) {
					objLink[i].disabled = true;
				}
			}
		}

		// ヘッダー項目の生成
		fncIncludeHeader();

		// フッター項目の生成
		fncIncludeFooter();

		// リソースをロード
		fncLoadResource();

		// 動的リンク生成
		fncGenerateDynamicLink();

		// 現在カテゴリーのID
		// TODO: ネームスペースを使用することになった場合、属性「toc_id」は「caesar:toc_id」となる
		var strCurrentCategoryId = document.getElementById("id_level_1").getAttribute("toc_id");

		// パンくずのIDリスト
		var strBreadCrumbsTocIds = "";
		var strCurrentTocId = ""; // 現在ページのID

		// トピック内にパンくずがある場合のみ処理実行
		if (document.getElementById("id_breadcrumbs")) {

			// パンくずの要素分繰り返し
			var nBreadcrumbsLength = document.getElementById("id_breadcrumbs").getElementsByTagName("a").length;
			for (var i = 0; i < nBreadcrumbsLength; i++) {

				// TODO: ネームスペースを使用することになった場合、属性「toc_id」は「caesar:toc_id」となる
				if (document.getElementById("id_breadcrumbs").getElementsByTagName("a")[i].getAttribute("toc_id")) {
					strBreadCrumbsTocIds += document.getElementById("id_breadcrumbs").getElementsByTagName("a")[i].getAttribute("toc_id");
					strCurrentTocId = document.getElementById("id_breadcrumbs").getElementsByTagName("a")[i].getAttribute("toc_id");
				}
			}
		}

		// HTMLマニュアルの各コンテンツに文書番号を挿入する
		// htmlファイル内に文書番号が存在するか判断
		var objDocumentNumber = document.getElementById("id_document_number");
		if (objDocumentNumber) {

			// コンテンツ最初の段落を取得  NOTE: FireFoxではwhitespaceをchildNodesの勘定に含める
			var objTarget = document.getElementById("id_content").childNodes[0];
			if (objTarget.className != "h1") {
				objTarget = document.getElementById("id_content").childNodes[1];
			}

			// コンテンツ最初の段落がh1であれば、文書番号を挿入
			if (objTarget.className == "h1") {
				objTarget.parentNode.insertBefore(objDocumentNumber, objTarget.nextSibling);
			}
		}

		var iHideLevel = 999;
		var bIsCurrentCategory = false;

		// カテゴリー別目次描画処理
		if (document.getElementById("id_toc")) {

			try {
				var v = eval(cover);
				var vLength = v.length;				
			} catch (e) {
				var vLength = 0;	
			}

			// 目次情報をJSONから取得
			var t = eval(toc);
			var tLength = t.length;
			for (var i = 0; i < tLength; i++) {

				// h1階層はプルダウンにカテゴリーとして出力
				if (t[i].level == 1) {

					if (t[i].show_toc == "n") {
						continue;
					}

					// <option>要素の作成
					var objOption = document.createElement("option");
					objOption.id = t[i].id;
					objOption.innerHTML = t[i].title;

					// プルダウンに要素を挿入
					document.getElementById("id_category_select").appendChild(objOption);

					// 当該カテゴリー以外の情報は出力しない
					if (strCurrentCategoryId == t[i].id) {
						bIsCurrentCategory = true;

						// 当該カテゴリーを選択状態にする
						objOption.selected = true;
					} else {
						bIsCurrentCategory = false;
					}
					if (bIsCurrentCategory) {
						var strTocLinkName = t[i].link_name;
						for (var j = 0; j < vLength; j++) {

							// toc.link_nameに「::」が含まれる場合、
							//「::」から前の文字列は上位グループ名
							//「::」から後の文字列はカテゴリー名
							var strDivMark = "::";
							var nDivPosition = strTocLinkName.indexOf(strDivMark);

							// toc.link_nameからカテゴリー名を取得
							if (nDivPosition != -1) {
								strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
							}

							if (v[j].cover_name == strTocLinkName) {
								var objHn = document.createElement("h2");
								var objSign = document.createElement("img");
								objSign.src = "../frame_images/toc_sign_0.gif";
								objHn.appendChild(objSign);

								// トピックにHTMLが存在する場合
								if (t[i].href) {

									// HTMLへのリンク要素を作成
									var objAnchor = document.createElement("a");
									objAnchor.href = "../contents/" + t[i].href;
									objAnchor.innerHTML = v[j].cover_title;

									// 現在表示中のトピック
									if (strCurrentTocId == t[i].id) {
										objAnchor.className = "current";
									}

									// 目次項目にHTMLへのリンク要素を挿入（[+][-]の後ろ）
									objHn.appendChild(objAnchor);

									// マウスオーバー時のティップス情報
									objHn.title = v[j].cover_title;

									// 目次項目をドキュメントに挿入
									document.getElementById("id_toc").appendChild(objHn);
								}
								break;
							}
						}
					}

				// カテゴリー下の目次階層
				} else {

					if (t[i].show_toc == "n") {
						continue;
					}

					// 当該カテゴリーのみ情報を出力
					if (bIsCurrentCategory) {

						// h2 - h6
						var objHn = document.createElement("h" + t[i].level);
						if (iHideLevel < t[i].level) {
							objHn.style.display = "None";
						} else {
							iHideLevel = 999;
						}

						// [+][-][ ]
						var objSign = document.createElement("img");

						// 子トピックあり
						if	(	(t[i + 1])
							&&	(t[i + 1].level > t[i].level)
							)
						{

							// [+][-]リンク要素の作成
							var objAnchorSign = document.createElement("a");

							// パンくず上に存在→展開
							if (strBreadCrumbsTocIds.indexOf(t[i].id) != -1) {
								objSign.src = "../frame_images/toc_sign_1.gif";

							// 折り畳み表示
							} else {
								objSign.src = "../frame_images/toc_sign_2.gif";

								// 現在のレベル以降を非表示にする
								if (iHideLevel == 999) {
									iHideLevel = t[i].level;
								}
							}

							// [+][-]クリック時処理の定義
							objAnchorSign.onclick = fncSwitchTocWrapper;
							objAnchorSign.href = "#";
							objAnchorSign.className = "sign";

							// [+][-]リンク要素に[+][-]マークを挿入
							objAnchorSign.appendChild(objSign);

							// 目次項目に[+][-]リンク要素を挿入
							objHn.appendChild(objAnchorSign);

						// 子トピックなし
						} else {
							objSign.src = "../frame_images/toc_sign_0.gif";
							objHn.appendChild(objSign);
						}
						//objHn.appendChild(objSign);

						// トピックにHTMLが存在する場合
						if (t[i].href) {

							// HTMLへのリンク要素を作成
							var objAnchor = document.createElement("a");
							objAnchor.href = "../contents/" + t[i].href;
							objAnchor.innerHTML = t[i].title;

							// 現在表示中のトピック
							if (strCurrentTocId == t[i].id) {
								objAnchor.className = "current";
							}

							// 目次項目にHTMLへのリンク要素を挿入（[+][-]の後ろ）
							objHn.appendChild(objAnchor);

						// 階層だけのノードの場合
						} else {
							var objSpan = document.createElement("span");
							objSpan.innerHTML = t[i].title;
							objHn.appendChild(objSpan);
						}

						// マウスオーバー時のティップス情報
						objHn.title = t[i].title;

						// 目次項目をドキュメントに挿入
						document.getElementById("id_toc").appendChild(objHn);
					}
				}
			}
		}

		// 前のカテゴリーのイベント定義
		document.getElementById("id_category_prev").onclick = function(){
			if (document.getElementById("id_category_select").selectedIndex - 1 < 0) {
				return;
			}
			document.location.href = "../contents/" + document.getElementById("id_category_select").options[document.getElementById("id_category_select").selectedIndex - 1].id + ".html";
		}
		document.getElementById("id_category_prev").onmouseover = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_prv_over.gif\")";
		}
		document.getElementById("id_category_prev").onmouseout = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_prv_out.gif\")";
		}
		document.getElementById("id_category_prev").onmousedown = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_prv_down.gif\")";
		}
		document.getElementById("id_category_prev").onmouseup = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_prv_out.gif\")";
		}

		// 次のカテゴリーのイベント定義
		document.getElementById("id_category_next").onclick = function(){
			if (document.getElementById("id_category_select").selectedIndex >= document.getElementById("id_category_select").options.length - 1) {
				return;
			}
			document.location.href = "../contents/" + document.getElementById("id_category_select").options[document.getElementById("id_category_select").selectedIndex + 1].id + ".html";
		}
		document.getElementById("id_category_next").onmouseover = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_nxt_over.gif\")";
		}
		document.getElementById("id_category_next").onmouseout = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_nxt_out.gif\")";
		}
		document.getElementById("id_category_next").onmousedown = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_nxt_down.gif\")";
		}
		document.getElementById("id_category_next").onmouseup = function(){
			this.style.backgroundImage = "Url(\"../frame_images/cat_nxt_out.gif\")";
		}

		// 印刷ボタンのイベント定義
		document.getElementById("id_res_print_button").onclick = function(){
			if (document.getElementById("id_print_all").checked) {
				window.open("../contents/print_category.html?chapter=" + strCurrentCategoryId);
			} else {
				fncPrint();
			}
		}

		fncSearchBox("src_bg");

		// カテゴリー選択プルダウン変更時のイベント定義
		document.getElementById("id_category_select").onchange = function(){
			document.location.href = "../contents/" + this.options[this.selectedIndex].id + ".html";
		}

		// すべてたたむリンクのイベント定義
		document.getElementById("id_res_close_toc_all").onclick = function(){
			fncOpenCloseAllToc(1);
		}

		// すべて開くリンクのイベント定義
		document.getElementById("id_res_open_toc_all").onclick = function(){
			fncOpenCloseAllToc(2);
		}

		// 詳細開閉処理
		var objAnchors = document.getElementsByTagName("a");
		var nAnchorLength = objAnchors.length;
		for (var i = 0; i < nAnchorLength; i++) {
			if (objAnchors[i].className == "open_close_next_sibling") {
				objAnchors[i].innerHTML = fncGetResourceByResourceId("open_next_sibling");
				objAnchors[i].className = "open_next_sibling";
				objAnchors[i].onclick = function(){
					fncOpenCloseNextSibling(this);
					return false;
				}
			} else if(objAnchors[i].className == "open_all") {
				objAnchors[i].innerHTML = fncGetResourceByResourceId("open_all");
				objAnchors[i].onclick = function(){
					fncOpenCloseAll("open");
					return false;
				}
			} else if(objAnchors[i].className == "close_all") {
				objAnchors[i].innerHTML = fncGetResourceByResourceId("close_all");
				objAnchors[i].onclick = function(){
					fncOpenCloseAll("close");
					return false;
				}
			}
		}

		// 各ペインをウィンドウサイズに合わせてサイズ調整
		fncOnResize();

		// 検索結果からジャンプしてきた場合、ヒット文字列をハイライトさせる
		if (document.location.search) {

			// 検索条件を引数から取得
			var strSearchText = document.location.search.split("?search=")[1];
			if (strSearchText != "") {

				// 検索条件文字列をデコード
				strSearchText = decodeURIComponent(strSearchText);

				// 正規表現文字列をエスケープ
				var regexpEscapeRegExp = /([$()\-^\\\|\[\]{},:+*.?])/g;
				if (regexpEscapeRegExp.exec(strSearchText) != null) {
					strSearchText = strSearchText.replace(regexpEscapeRegExp, "\\$1");
				}

				// 複数検索条件を分解（全半角スペース）
				var res = / |　/;
				var arrSearchText = strSearchText.split(res);
				var nSearchTextLength = arrSearchText.length;

				// コンテンツ領域内のテキスト要素をハイライト
				fncMarkupText(
					document.getElementById("id_content"),
					arrSearchText
				);

				// 最初にヒットした文字列までスクロール
				if (document.getElementById("id_hit")) {
					document.getElementById("id_hit").scrollIntoView(true);
				}
			}
		} else {

			// IEの場合リンクアンカーまでスクロールしないので、自前でアンカー位置にスクロール
			if (document.all) {
				if (document.location.hash != "") {
					var strHash = document.location.hash.substring(1);
					if (document.all.item(strHash)) {
						document.all.item(strHash).scrollIntoView(true);
					}
				}
			}
		}
		document.getElementById("id_content").onresize = fncRecalcScroll;
	} catch(e) {
	}
}

function fncMarkupText(element, arrSearchText){
	try {

		// 子ノード数分繰り返し
		var nElementChildLength = element.childNodes.length;
		for (var i = 0; i < nElementChildLength; i++) {
			var child = element.childNodes[i];

			// #textまでたどり着いたらマークアップ処理
			if (child.nodeType == 3) { // #text

				var strNodeValue = child.nodeValue;

				// NOTE: Safariにおいて検索画面からジャンプした際に表レイアウトが崩れる現象を回避
				// トリムした結果文字列が残らない場合はマーキング処理を実行しない
				var strNodeValueTemp = strNodeValue.replace(/\t| |\n/g,"");
				if (strNodeValueTemp == "") {
					continue;
				}

				// マーキング対象の有無
				var bIsMarkedup = false;

				// 各検索条件文字列にマーキング
				// 10種類のカラーバリエーションを循環
				var nMarkerColor = 0;
				var nSearchTextLength = arrSearchText.length;
				for (var j = 0; j < nSearchTextLength; j++) {

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
					var strSearchText = arrSearchText[j];
					var re = new RegExp("(" + strSearchText + ")", "gi");

					if (re.exec(strNodeValue) != null) {

						// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
						// またマーキング用のタグ文字列と部分合致するキーワードが検索された場合にマーキング用タグまで文字列置換されてしまうことを防ぐ
						// マーキング開始タグの開始:	⁅(U+2045(Left Square Bracket With Quill))
						// マーキング開始タグの終了:	⁆(U+2045(Right Square Bracket With Quill))
						// マーキング終了タグ:			₎(U+208E(Subscript Right Parenthesis))
						var strNodeValue = strNodeValue.replace(re, "⁅" + strMarkerColor + "⁆$1₎");
						bIsMarkedup = true;
					}
					nMarkerColor++;
					if (nMarkerColor >= 10) {
						nMarkerColor = 0;
					}
				}
				if (bIsMarkedup) {

					// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
					strNodeValue = strNodeValue.replace(/</g,"&lt;");
					strNodeValue = strNodeValue.replace(/>/g,"&gt;");

					// マーキングタグを復元
					strNodeValue = strNodeValue.replace(/⁅/g,"<span id=\"id_hit\" class=\"hit hit_");
					strNodeValue = strNodeValue.replace(/⁆/g,"\">");
					strNodeValue = strNodeValue.replace(/₀/g,"0");
					strNodeValue = strNodeValue.replace(/₁/g,"1");
					strNodeValue = strNodeValue.replace(/₂/g,"2");
					strNodeValue = strNodeValue.replace(/₃/g,"3");
					strNodeValue = strNodeValue.replace(/₄/g,"4");
					strNodeValue = strNodeValue.replace(/₅/g,"5");
					strNodeValue = strNodeValue.replace(/₆/g,"6");
					strNodeValue = strNodeValue.replace(/₇/g,"7");
					strNodeValue = strNodeValue.replace(/₈/g,"8");
					strNodeValue = strNodeValue.replace(/₉/g,"9");
					strNodeValue = strNodeValue.replace(/₎/g,"</span>");

					// マーキング済みの文字列に差し替え
					var newNode = document.createElement("span");
					newNode.innerHTML = strNodeValue;
					element.replaceChild(newNode, child);
				}
			// <div><span><a>はさらに子ノードを処理
			} else {
				fncMarkupText(child, arrSearchText);
			}
		}
	} catch (e) {
	}
}

// IE7でid_content内のscrollHeightが誤認識する問題に対応
function fncRecalcScroll(){
	try {

		// IEのみ有効
		if ((document.all) && (window.XMLHttpRequest)) {

			// コンテンツ領域
			var objContent = document.getElementById("id_content");

			// コンテンツ領域内の要素数をカウント
			var nContentLength = objContent.childNodes.length;

			// 現在のスクロール位置を保持
			var nCurrentScrollTop = objContent.scrollTop;

			// 一旦コンテンツ最下部にスクロールし、正しいscrollHeightを認識させる
			objContent.childNodes[nContentLength - 1].scrollIntoView(false);

			// 元のスクロール位置に復元
			var tIdScroll = setTimeout(fncDelay, 0);
			function fncDelay(){
				objContent.scrollTop = nCurrentScrollTop;
			}
		}
	} catch (e) {
	}
}

// 各ペインをウィンドウサイズに合わせてサイズ調整
window.onresize = fncOnResize;
function fncOnResize(){
	try{

		// ウィンドウサイズの取得
		var obj = window;
		if (window.opera) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		} else if(document.all) {
			var w = obj.document.body.clientWidth;
			var h = obj.document.body.clientHeight;
		} else if(document.getElementById) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		}

		// メインウィンドウ
		if (document.location.search.indexOf("?sub=yes") == -1) {
			document.getElementById("id_left").style.height = h - 93 + "px";
			document.getElementById("id_toc").style.height = h - 125 + "px";
			document.getElementById("id_content").style.height = h - 93 + "px";
			document.getElementById("id_content").style.width = w - 300 + "px";
			document.getElementById("id_footer").style.top = h - 26 + "px";
			document.getElementById("id_footer").style.width = w + "px";

		// 別ウィンドウ
		} else {
			document.getElementById("id_content").style.height = h - 28 + "px";
			document.getElementById("id_close").style.top = h - 28 + "px";
		}
	}catch(e){
	}
}

// 印刷用のサイズ調整
window.onbeforeprint = function fncResizeForPrint(){
	try{

		// 第2階層ページの印刷
		if (document.location.search.indexOf("?sub=yes") == -1) {

			// コンテンツ表示領域を全幅に設定
			document.getElementById("id_content").style.width = "100%";

		// 別ウィンドウページの印刷
		} else {

			// 印刷時にスクロールが表示されて複数ページを印刷できない現象を回避
			//document.getElementById("id_content").style.overflow = "Visible";
		}
	}catch(e){
	}
}
window.onafterprint = function fncResizeForScreen(){
	try{

		// 第2階層ページの印刷
		if (document.location.search.indexOf("?sub=yes") == -1) {

			// 各ペインをウィンドウサイズに合わせてサイズリセット
			fncOnResize();

		// 別ウィンドウページの印刷
		} else {
			
			// スクロール表示リセット
			//document.getElementById("id_content").style.overflow = "Auto";
		}
	}catch(e){
	}
}

// カテゴリー目次[+][-]開閉処理
function fncSwitchTocWrapper(){
	fncSwitchToc(this);
}
function fncSwitchToc(eSrc){
	try{

		var iTargetLevel = 999; // 初期値
		var strDisplay = "";

		// [-] -> [+]
		if (eSrc.childNodes[0].src.lastIndexOf("toc_sign_1") != -1) {
			eSrc.childNodes[0].src = "../frame_images/toc_sign_2.gif";
			strDisplay = "None";

		// [+] -> [-]
		} else if(eSrc.childNodes[0].src.lastIndexOf("toc_sign_2") != -1) {
			eSrc.childNodes[0].src = "../frame_images/toc_sign_1.gif";
			strDisplay = "Block";
		}

		// 目次項目ループ
		var objHns = document.getElementById("id_toc").childNodes;
		var nHnLength = objHns.length;
		for (var i = 0; i < nHnLength; i++) {

			// 表示切替開始位置を探索
			if (document.getElementById("id_toc").childNodes[i] === eSrc.parentNode) {

				// 処理対象レベルを取得（クリックされた[+][-]がh2ならば、表示切替対象はh3）
				iTargetLevel = parseInt(eSrc.parentNode.nodeName.substring(1)) + 1;
				continue;
			}

			// [-] -> [+]がクリックされた場合、下階層すべてを非表示にする
			if (strDisplay == "None") {
				if (parseInt(objHns[i].nodeName.substring(1)) >= iTargetLevel) {

					// 表示を切り替え
					objHns[i].style.display = strDisplay;

					// [-][+] -> [+]
					if (objHns[i].childNodes[0].nodeName.toLowerCase() == "a") {
						objHns[i].childNodes[0].childNodes[0].src = "../frame_images/toc_sign_2.gif";
					}
				} else {
					if (iTargetLevel != 999) {
						break;
					}
					continue;
				}

			// [+] -> [-]がクリックされた場合、下階層のみを表示する
			} else {
				if (parseInt(objHns[i].nodeName.substring(1)) == iTargetLevel) {

					// 表示を切り替え
					objHns[i].style.display = strDisplay;
					continue;
				} else {
					if (	(iTargetLevel != 999)
						&&	(iTargetLevel > parseInt(objHns[i].nodeName.substring(1)))
					) {
						break;
					}
					continue;
				}
			}
		}
	}catch(e){
	}
}

// カテゴリー目次一括開閉処理
function fncOpenCloseAllToc(nMethod){
	try {
		var objSign = document.getElementById("id_toc").getElementsByTagName("img");
		var nSignLength = objSign.length;
		for (var i = 0; i < nSignLength; i++) {
			if (objSign[i].src.lastIndexOf("toc_sign_" + nMethod + ".gif") != -1) {
				if (document.all) {
					objSign[i].click();
				} else {
					fncSwitchToc(objSign[i].parentNode);
				}
			}
		}
	} catch (e) {
	}
}

// 詳細開閉処理
function fncOpenCloseNextSibling(eSrc){
	try{
		var objNextSibling;
		if (document.all) {
			objNextSibling = eSrc.parentNode.nextSibling;
		} else {
			objNextSibling = eSrc.parentNode.nextSibling.nextSibling;
		}
		if (objNextSibling.style.display.toLowerCase() != "block") {
			objNextSibling.style.display = "block";
			eSrc.innerHTML = fncGetResourceByResourceId("close_next_sibling");
			eSrc.className = "close_next_sibling";
		} else {
			objNextSibling.style.display = "none";
			eSrc.innerHTML = fncGetResourceByResourceId("open_next_sibling");
			eSrc.className = "open_next_sibling";
		}
	}catch(e){
	}
}

// 詳細一括開閉処理
function fncOpenCloseAll(strMethod){
	try{
		var objDivs = document.getElementsByTagName("div");
		var nDivLength = objDivs.length;
		for (var i = 0; i < nDivLength; i++) {
			if (objDivs[i].className == "invisible") {
				var objPreviousSibling;
				if (document.all) {
					objPreviousSibling = objDivs[i].previousSibling;
				} else {
					objPreviousSibling = objDivs[i].previousSibling.previousSibling;
				}
				if (strMethod == "open") {
					objDivs[i].style.display = "block";
					if	(	(objPreviousSibling.childNodes[0].className == "open_next_sibling")
						||	(objPreviousSibling.childNodes[0].className == "close_next_sibling")
						)
					{
						objPreviousSibling.childNodes[0].innerHTML = fncGetResourceByResourceId("close_next_sibling");
						objPreviousSibling.childNodes[0].className = "close_next_sibling";
					}
				} else {
					objDivs[i].style.display = "none";
					if	(	(objPreviousSibling.childNodes[0].className == "open_next_sibling")
						||	(objPreviousSibling.childNodes[0].className == "close_next_sibling")
						)
					{
						objPreviousSibling.childNodes[0].innerHTML = fncGetResourceByResourceId("open_next_sibling");
						objPreviousSibling.childNodes[0].className = "open_next_sibling";
					}
				}
			}
		}
	}catch(e){
	}
}