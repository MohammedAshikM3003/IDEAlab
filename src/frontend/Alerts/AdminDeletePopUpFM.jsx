import React, { useState } from "react";

import styles from "./AdminDeletePopUpFM.module.css";

export default function AdminDeletePopUpFM({ onClose, onConfirm, bookingName = "CS Department Exam" }) {
	const [reason, setReason] = useState("");

	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm({ reason });
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.backdrop} role="dialog" aria-modal="true">
				<div className={styles.modal}>
					<div className={styles.warningCircle}>
						<span className="material-symbols-outlined" aria-hidden="true">
							warning
						</span>
					</div>

					<h2 className={styles.title}>Cancel This Booking?</h2>

					<p className={styles.description}>
						Are you sure you want to cancel the <strong>{bookingName}</strong>? This action cannot be undone and will notify the
						organizer immediately.
					</p>

					<div className={styles.section}>
						<label className={styles.label} htmlFor="cancel-reason">
							Reason for Cancellation <span className={styles.optional}>(Optional)</span>
						</label>
						<textarea
							className={styles.textarea}
							id="cancel-reason"
							placeholder="e.g., Administrative override, Maintenance required..."
							rows={4}
							value={reason}
							onChange={(event) => setReason(event.target.value)}
						/>
					</div>

					<div className={styles.footer}>
						<button className={styles.keepBtn} type="button" onClick={onClose}>
							Keep Booking
						</button>

						<button className={styles.cancelBtn} type="button" onClick={handleConfirm}>
							Yes, Cancel Booking
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
