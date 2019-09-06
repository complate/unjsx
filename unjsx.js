import walk from "acorn-walk";
import MagicString from "magic-string";

export default {
	name: "unjsx",
	transform(code, id) {
		code = new MagicString(code);
		if (!id.endsWith(".jsx")) { // XXX: simplistic?
			return null;
		}

		let ast = this.parse(code);
		let state = { code };
		walk.recursive(ast,
			state,
			walk.make({ JSXElement, JSXExpressionContainer, JSXOpeningElement, JSXClosingElement }, walk.base),
			walk.base);
			console.log(code.toString());
		return code.toString(); // { ast, code: code.toString(), sourceMap: code... };
	}
};

function JSXElement({ openingElement, closingElement, children }, state, c) {
	c(openingElement, state);

	// TODO: detect joinable sequences
	children.forEach(child => {
		if (child.type === "JSXText") {
			let txt = htmlEncode(child.value);
			if (txt.trim()) { // XXX: skipping whitespace merely to reduce reporting noise
				state.code.overwrite(child.start, child.end, JSON.stringify(txt.trim()) + ",\n");
			}
		}
		else { // Might only be JSXElement or JSXExpression or JSXFragment
			c(child, state);
			state.code.appendLeft(child.end, ",");		}
	});

	c(closingElement, state);
}

function JSXOpeningElement({ name, attributes, start, end }, state, c) {
	let tagName = name.name;
	if (/^[A-Z]/.test(tagName)) { // not a native element
		return;
	}

	let _attribs = attributes.reduce((memo, {name, value}) => {
		if (!value) { // boolean attribute -- XXX: not confident this is always correct
			memo.static.push(name ? name.name : "UNKNOWN!");
		} else if (value.type === "Literal") { // XXX: simplistic?
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
	state.code.overwrite(start, end, `['<${tagName}${_static}${_other}>',\n`);
}

function JSXClosingElement({name, start, end}, state, c) {
	state.code.overwrite(start, end, `'</${name.name}>']`);
}

function JSXExpressionContainer({ expression, start, end }, state, c) {
	state.code.overwrite(start, start + 1, "");
	c(expression, state);
	state.code.overwrite(end - 1, end, "");
}

// adapted from TiddlyWiki <http://tiddlywiki.com> and Python 3's `html` module
function htmlEncode(str, attribute) {
	let res = str.replace(/&/g, "&amp;").
		replace(/</g, "&lt;").
		replace(/>/g, "&gt;");
	if (attribute) {
		res = res.replace(/"/g, "&quot;").
			replace(/'/g, "&#x27;");
	}
	return res;
}
