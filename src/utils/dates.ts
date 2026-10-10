export function getUpcomingWeekDays() {
  const now = new Date();
  const currentHour = now.getHours();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const result = [];

  const currentDayOfWeek = now.getDay(); 
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const mondayCurrentWeek = new Date(today);
  mondayCurrentWeek.setDate(today.getDate() + distanceToMonday);

  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(mondayCurrentWeek);
    targetDate.setDate(mondayCurrentWeek.getDate() + i);

    const dayOfWeek = targetDate.getDay();

    if (dayOfWeek === 0) continue;

    if (targetDate < today) continue;

    const isToday = targetDate.getTime() === today.getTime();
    if (isToday && currentHour >= 17) {
      continue;
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    const isoDate = `${year}-${month}-${day}`;
    const nombre = daysNames[dayOfWeek];
    const label = `${nombre} (${day}/${month})`;

    result.push({ nombre, isoDate, label });
  }

  return result;
}