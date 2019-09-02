import Document from "./document";

export default function DefaultPage(params, ...children) {
	return <Document stylesheets={["bundle.css"]} {...params}>
		<h1>{params.title}</h1>
		{children}
	</Document>;
}
