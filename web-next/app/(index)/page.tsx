import styles from "./page.module.css";
import Homepage from "./Homepage";
import { devAPI as api } from "@/lib/api";

export default async function Home() {
	const { user } = await api.TestUser({});
	return (
		<div className={styles.page}>
			<Homepage />
			{user && (
				<>
					<main className={styles.main}>
						<p>The user ID is: {user.id}</p>
						<p>username is: {user.username}</p>
						<p>bio is: {user.bio}</p>
						<p>pronouns are: {user.pronouns}</p>
					</main>
					<footer className={styles.footer}>Footer content</footer>
				</>
			)}
		</div>
	);
}
