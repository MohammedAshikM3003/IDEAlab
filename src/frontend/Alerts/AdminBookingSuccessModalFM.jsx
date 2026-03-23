import React from "react";

import styles from "./AdminBookingSuccessModalFM.module.css";

export default function AdminBookingSuccessModalFM({
	onClose,
	eventTitle = "HOD Meeting",
	venue = "Seminar Hall",
	date = "Oct 24, 2026",
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

					<h2 className={styles.title}>Booking Confirmed!</h2>

					<p className={styles.description}>
						The {eventTitle} has been successfully scheduled for
					</p>

					<p className={styles.dateText}>
						<span className="material-symbols-outlined" aria-hidden="true">
							calendar_month
						</span>
						<span>{date}</span>
					</p>

					<p className={styles.metaText}>{venue}</p>

					<button className={styles.doneBtn} type="button" onClick={onClose}>
						Done
					</button>

					<button className={styles.linkBtn} type="button" onClick={onClose}>
						View in Availability Tracker <span aria-hidden="true">→</span>
					</button>
				</div>
			</div>
		</div>
	);
}
