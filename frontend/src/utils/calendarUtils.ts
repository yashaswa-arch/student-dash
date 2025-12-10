/**
 * Generate an .ics (iCalendar) file content string for a contest
 * @param contest - Contest object with name, url, startTime, endTime
 * @returns ICS file content as string
 */
export function createIcsForContest(contest: {
  name: string
  url: string
  startTime: string | Date
  endTime: string | Date
}): string {
  // Convert startTime and endTime to Date objects if they're strings
  const startDate = typeof contest.startTime === 'string' 
    ? new Date(contest.startTime) 
    : contest.startTime
  const endDate = typeof contest.endTime === 'string' 
    ? new Date(contest.endTime) 
    : contest.endTime

  // Format date to UTC in ICS format: YYYYMMDDTHHMMSSZ
  const formatIcsDate = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
  }

  const dtStart = formatIcsDate(startDate)
  const dtEnd = formatIcsDate(endDate)
  
  // Generate unique ID (using timestamp and random)
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@skill-analytics-platform`

  // Escape text for ICS format (escape commas, semicolons, backslashes, newlines)
  const escapeIcsText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const summary = escapeIcsText(contest.name)
  const description = escapeIcsText(`Contest link: ${contest.url}`)
  const url = contest.url

  // Get current timestamp for DTSTAMP
  const dtStamp = formatIcsDate(new Date())

  // Build ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SAP - Skill Analytics Platform//Contest Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `URL:${url}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

