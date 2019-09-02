export default function Document(
	{ title, lang = "en", stylesheets, scripts },
	...children
) {
	return <html lang={lang}>
		<head>
			<meta charset="utf-8" />
			<title>{title} | My Website</title>
			{renderStyleSheets(stylesheets)}
		</head>

		<body>
			{children}

			{renderScripts(scripts)}
			<WebAnalytics id={context.trackingID} />
		</body>
	</html>;
}

function WebAnalytics({ id }) {
	let code = `
var _paq = _paq || [];
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
_paq.push(["setTrackerUrl", "${context.uri("analytics.collector")}"]);
_paq.push(["setSiteId", "${id}"]);
	`.trim();
	return <Fragment>
		<script>{code}</script>
		<script src={context.uri("analytics.script")} async defer />
		<noscript>
			<img src={context.uri("analytics.beacon")} style="border: 0" alt="" />
		</noscript>
	</Fragment>;
}

function renderStyleSheets(items) {
	if(!items || !items.length) {
		return;
	}

	return items.map(uri => (
		<link rel="stylesheet" href={uri} />
	));
}

function renderScripts(items) {
	if(!items || !items.length) {
		return;
	}

	return items.map(uri => (
		<script src={uri} defer />
	));
}
