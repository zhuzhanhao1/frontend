/**
 * @param {string} time
 * @returns {string}
 */
export function formatTime(time) {
  return this.dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
