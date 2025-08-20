// Stub for sending email notifications
export function sendEmailNotification({ to, subject, text }) {
  // In production, integrate with an email service
  console.log(`Email to ${to}: ${subject} - ${text}`);
}

// Stub for emitting in-app notifications (could be replaced with socket.io, etc.)
export function emitInAppNotification({ userId, message, type }) {
  // In production, push to a notification service or websocket
  console.log(`In-app notification to ${userId}: [${type}] ${message}`);
}
