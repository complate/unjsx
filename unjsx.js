import walk from "acorn-walk";

let base = {
	...walk.base,
	JSXElement() {}
};

export default {
	name: "unjsx",
	transform(code, id) {
		if(!id.endsWith(".jsx")) { // XXX: simplistic?
			return null;
		}

		let ast = this.parse(code);
		walk.simple(ast, { JSXElement }, base);

		return { code, ast };
	}
};

function JSXElement({ openingElement, closingElement, children }) {
	let { name, attributes } = openingElement;
	if(!/^[a-z]/.test(name.name)) { // not a native element
		return;
	}

	let _attribs = attributes.reduce((memo, { name, value }) => {
		if(!value) {
			memo.literals.push(`${name.name}=\`${value}\``);
		} else if(value.type === "Literal") { // XXX: simplistic?
			memo.literals.push(`${name.name}="${htmlEncode(value.value, true)}"`);
		} else {
			memo.other++;
		}
		return memo;
	}, { literals: [], other: 0 });
	if(_attribs.literals.length) {
		let { literals } = _attribs;
		let suffix = _attribs.other === 0 ? "" : ` [+${_attribs.other}]`;
		console.log(`🏷️  <${name.name} ${literals.join(" ")}${suffix}>`);
	}

	if(children.length) {
		analyzeChildren(children);
	}
}

function analyzeChildren(children) {
	let _simpleChildren = [];
	let otherChildren = children.some(({ type, value }) => {
		if(type !== "JSXText") {
			return true;
		}

		_simpleChildren.push(value);
	});
	if(!otherChildren) {
		let txt = _simpleChildren.map(child => htmlEncode(child)).join("");
		console.log(`🧒  ${txt.trim()}`);
	}
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
