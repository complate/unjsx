import DefaultPage from "./fixtures/page";
import Card from "./fixtures/card";

<DefaultPage title="Hello World">
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
</DefaultPage>
