import React from "react";

import styles from "./AdminInquirySentPopUpFM.module.css";

export default function AdminInquirySentPopUpFM({
	onClose,
	bookingName = "CS Department Exam",
	organizerName = "Prof. Rahul",
}) {
	return (
		<div className={styles.page}>
			<div className={styles.backdrop} role="dialog" aria-modal="true">
				<div className={styles.modal}>
					<div className={styles.successCircle}>
						<span className="material-symbols-outlined" aria-hidden="true">
							check
						</span>
					</div>

					<h2 className={styles.title}>Booking Cancelled</h2>

					<p className={styles.description}>
						The {bookingName} has been removed from the schedule. A cancellation notification email has been automatically sent
						to {organizerName}.
					</p>

					<button className={styles.returnBtn} type="button" onClick={onClose}>
						Return to Dashboard
					</button>
				</div>
			</div>
		</div>
	);
}
