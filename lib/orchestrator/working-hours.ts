export function isClinicOpen(date = new Date()) {
  const day = date.getDay();
  const hour = date.getHours();

  const isSunday = day === 0;
  const opensAt = 8;
  const closesAt = 18;

  if (isSunday) return false;

  return hour >= opensAt && hour < closesAt;
}

export function closedMessage() {
  return (
    "Hello, we are currently closed. Our working hours are Monday to Saturday, 8:00 AM - 6:00 PM. " +
    "Please leave your request and our receptionist will confirm it during working hours."
  );
}