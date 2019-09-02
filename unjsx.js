import walk from "acorn-walk";

let base = {
	...walk.base,
	JSXElement() {} // XXX: insufficient?
};

export default {
	name: "unjsx",
	transform(code, id) {
		if(!id.endsWith(".jsx")) { // XXX: simplistic?
			return null;
		}

		let ast = this.parse(code);
		analyze(ast);

		return { ast, code };
	}
};

function analyze(ast) {
	walk.simple(ast, { JSXElement }, base);
}

function JSXElement({ openingElement, closingElement, children }) {
	let { name, attributes } = openingElement;
	let tagName = name.name;
	if(!/^[a-z]/.test(tagName)) { // not a native element
		return;
	}

	let _attribs = attributes.reduce((memo, { name, value }) => {
		if(value === null) { // boolean attribute -- XXX: not confident this is always correct
			memo.static.push(name.name);
		} else if(value.type === "Literal") { // XXX: simplistic?
			memo.static.push(`${name.name}="${htmlEncode(value.value, true)}"`);
		} else {
			memo.other++; // TODO: distinguish static names with dynamic values?
		}
		return memo;
	}, { static: [], other: 0 });

	let _static = _attribs.static;
	let _other = _attribs.other;
	_static = _static.length === 0 ? "" : " " + _static.join(" ");
	_other = _other === 0 ? "" : ` [+${_other}]`;
	console.log(`<${tagName}${_static}${_other}>`);

	// TODO: detect joinable sequences
	children.forEach((child, i) => {
		switch(child.type) {
		case "JSXText": {
			let txt = htmlEncode(child.value);
			if(txt.trim()) { // XXX: skipping whitespace merely to reduce reporting noise
				console.log(JSON.stringify(txt));
			}
			break;
		}
		case "JSXElement": {
			analyze(child); // XXX: manual recursion should not be necesary!?
			break;
		}
		default:
			break;
		}
	});
}

// adapted from TiddlyWiki <http://tiddlywiki.com> and Python 3's `html` module
function htmlEncode(str, attribute) {
	let res = str.replace(/&/g, "&amp;").
		replace(/</g, "&lt;").
		replace(/>/g, "&gt;");
	if(attribute) {
		res = res.replace(/"/g, "&quot;").
			replace(/'/g, "&#x27;");
	}
	return res;
}
