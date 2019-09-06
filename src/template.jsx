/* global createElement */

let arr = ['a', 'b', 'c']

foo = {bar: 123}

export default ({ id, title, desc }) => {
	<div>This should be ignored!</div>
	return <article class="blog-post" id={id}>
			lorem ipsum <p><span>Some Text</span></p>
			{title}
			<p>{desc}</p>
			dolor sit amet
			{arr.map(e => <div>node: {e}</div>)}
		</article>
}

