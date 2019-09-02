import escodegen from "escodegen";
import estraverse from "estraverse";

export default {
	name: "unjsx",
	transform(code, id) {
		if(!id.endsWith(".jsx")) { // XXX: simplistic?
			return null;
		}

		let ast = this.parse(code);
		ast = estraverse.replace(ast, {
			keys: {
				JSXElement: [] // XXX: ¯\_(ツ)_/¯
			},
			enter(node, parent) {
				if(node.type === "JSXElement") {
					return JSXElement(node, parent);
				}
			}
		});

		return {
			ast,
			code: escodegen.generate(ast) // XXX: messes with source maps? -- XXX: should not be necessary!?
		};
	}
};

function JSXElement(node, parent) {
	let { openingElement, closingElement, children } = node;
	let { name, attributes } = openingElement;
	let tagName = name.name;
	if(!/^[a-z]/.test(tagName)) { // not a native element
		return;
	}

	let _attribs = attributes.reduce((memo, { name, value }) => {
		if(!value) {
			memo.literals.push(`${name.name}=\`${value}\``);
		} else if(value.type === "Literal") { // XXX: simplistic?
			memo.literals.push(`${name.name}="${htmlEncode(value.value, true)}"`);
		} else {
			let id = value.expression.name;
			let _value = id ? `\`${id}\`` : `[${value.type}]`;
			console.log(`[skip] ${name.name}=${_value}`,
					id ? "" : serializeExpression(value.expression));
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

	return { // XXX: should be a proper `Node` instance? (also because source maps)
		type: "Literal",
		value: `<${tagName}>` // XXX: DEBUG
	};
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

function serializeExpression(expr) {
	switch(expr.type) {
	case "LogicalExpression":
		let { left, operator, right } = expr;
		return [`«${left.type} ${left.name || left.value || "TODO"}»`, operator,
				`«${right.type} ${right.name || right.value || "TODO"}»`].join(" ");
	default:
		return expr;
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
