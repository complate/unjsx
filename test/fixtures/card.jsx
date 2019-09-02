export default function Card({ title }, ...children) {
	return <article class="card">
		<header>
			<h2>{title}</h2>
		</header>
		{children}
	</article>;
}
