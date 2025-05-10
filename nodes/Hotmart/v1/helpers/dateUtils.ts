// Função utilitária global para converter datas para timestamp UTC/GMT
export function convertToTimestamp(date: string | number): number | undefined {
	if (typeof date === 'number') return date;
	if (typeof date === 'string') {
		const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(date);
		const dateWithTz = hasTimezone ? date : date.replace(' ', 'T') + 'Z';
		const ts = Date.parse(dateWithTz);
		return isNaN(ts) ? undefined : ts;
	}
	return undefined;
}
