import Card from "./fixtures/card";
import Document from "./fixtures/document";

<Document title="Hello World" stylesheets={["bundle.css"]}>
	<h1>Hello World</h1>

	<Card title="important note">
		<p>nothing to see here</p>
	</Card>

	<Card title="random list">
		<ul>
			<li>lorem ipsum</li>
			{["foo", "bar", "baz"].map(item => (
				<li>{item}</li>
			))}
			<li>dolor sit amet</li>
		</ul>
	</Card>
</Document>
