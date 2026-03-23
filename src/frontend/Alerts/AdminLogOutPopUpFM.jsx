import React from "react";

import styles from "./AdminLogOutPopUpFM.module.css";

export default function AdminLogOutPopUpFM({ onClose, onConfirm }) {
	return (
		<div className={styles.page}>
			<div className={styles.backdrop} role="dialog" aria-modal="true">
				<div className={styles.modal}>
					<div className={styles.warningCircle}>
						<span className="material-symbols-outlined" aria-hidden="true">
							warning
						</span>
					</div>

					<h2 className={styles.title}>Log Out?</h2>
					<p className={styles.subtitle}>You will be returned to the login screen.</p>

					<div className={styles.footer}>
						<button className={styles.stayBtn} type="button" onClick={onClose}>
							Stay
						</button>

						<button className={styles.logoutBtn} type="button" onClick={onConfirm}>
							Log Out
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
